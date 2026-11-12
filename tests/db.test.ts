import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { asRole, createTestDb } from "./db-harness";

let db: PGlite;
const one = async <T>(sql: string, params: unknown[] = []) => (await db.query<T>(sql, params)).rows[0] as T;
const pid = async (legacy: string) => (await one<{ id: string }>("select id from products where legacy_id = $1", [legacy])).id;

const customer = { name: "Test Buyer", phone: "9876543210", email: "buyer@example.com" };
const address = { ...customer, line1: "12 MG Road", city: "Pune", state: "Maharashtra", pincode: "411001" };

async function createOrder(items: { product_id: string; quantity: number }[]) {
  return asRole(db, "service_role", async () =>
    (await one<{ id: string }>("select public.create_order($1, $2, $3, 499, 49) as id", [customer, address, JSON.stringify(items)])).id,
  );
}

beforeAll(async () => {
  db = await createTestDb();
}, 60_000);

describe("schema + seed", () => {
  it("loads the seed catalogue", async () => {
    expect((await one<{ n: number }>("select count(*)::int n from categories")).n).toBe(20);
    expect((await one<{ n: number }>("select count(*)::int n from products")).n).toBe(20);
    expect((await one<{ n: number }>("select count(*)::int n from product_images")).n).toBe(100);
    expect((await one<{ n: number }>("select count(*)::int n from blog_posts where is_published")).n).toBe(3);
  });
});

describe("search_products", () => {
  const search = async (q: string) =>
    (await db.query<{ slug: string }>("select p.slug from search_products($1) s join products p on p.id = s.id", [q])).rows.map((r) => r.slug);

  it("matches prefixes and plurals", async () => {
    expect((await search("jars"))[0]).toBe("airtight-jar-set-6pc");
    expect(await search("mop")).toContain("spin-mop-bucket-set");
  });
  it("matches category names", async () => {
    expect((await search("bathroom")).length).toBeGreaterThan(0);
  });
  it("ignores tsquery syntax characters safely", async () => {
    await expect(search("jar & | ! ( ) :*")).resolves.toBeInstanceOf(Array);
    expect(await search("")).toEqual([]);
  });
});

describe("create_order", () => {
  it("re-prices from the catalogue and locks item prices", async () => {
    const id = await createOrder([
      { product_id: await pid("prd_001"), quantity: 2 },
      { product_id: await pid("prd_011"), quantity: 1 },
    ]);
    const o = await one<{ number: string; subtotal: string; shipping: string; total: string; status: string }>("select * from orders where id = $1", [id]);
    expect(o.status).toBe("pending_payment");
    expect(o.number).toMatch(/^CS\d{4,}$/);
    expect(Number(o.subtotal)).toBe(449 * 2 + 199);
    expect(Number(o.shipping)).toBe(0);
    expect(Number(o.total)).toBe(1097);
    const items = (await db.query<{ unit_price: string; meesho_price: string; path: string }>("select * from order_items where order_id = $1 order by unit_price desc", [id])).rows;
    expect(items).toHaveLength(2);
    expect(Number(items[0]!.unit_price)).toBe(449);
    expect(Number(items[0]!.meesho_price)).toBe(260);
    expect(items[0]!.path).toBe("/kitchen/storage-containers/airtight-jar-set-6pc");
    expect((await one<{ n: number }>("select count(*)::int n from order_events where order_id = $1", [id])).n).toBe(1);
  });

  it("adds the shipping fee below the free-shipping threshold and merges duplicate lines", async () => {
    const p = await pid("prd_011");
    const id = await createOrder([
      { product_id: p, quantity: 1 },
      { product_id: p, quantity: 1 },
    ]);
    const o = await one<{ subtotal: string; shipping: string; total: string }>("select * from orders where id = $1", [id]);
    expect(Number(o.subtotal)).toBe(398);
    expect(Number(o.shipping)).toBe(49);
    expect(Number(o.total)).toBe(447);
  });

  it("rejects out-of-stock and unknown products", async () => {
    await expect(createOrder([{ product_id: await pid("prd_008"), quantity: 1 }])).rejects.toThrow(/out of stock/);
    await expect(createOrder([{ product_id: "00000000-0000-0000-0000-000000000000", quantity: 1 }])).rejects.toThrow(/no longer available/);
    await expect(createOrder([])).rejects.toThrow(/empty/);
  });
});

describe("mark_order_paid", () => {
  it("is idempotent, checks amount and Razorpay order, and decrements stock", async () => {
    const product = await pid("prd_004");
    const before = (await one<{ stock: number }>("select stock from products where id = $1", [product])).stock;
    const id = await createOrder([{ product_id: product, quantity: 3 }]);
    await db.query("update orders set razorpay_order_id = 'order_TEST1' where id = $1", [id]);
    const pay = (rzp: string | null, amount: number | null) =>
      asRole(db, "service_role", () => one<{ changed: boolean }>("select * from mark_order_paid($1, $2, 'pay_1', $3)", [id, rzp, amount]));

    await expect(pay("order_TEST1", 100)).rejects.toThrow(/does not match/);
    await expect(pay("order_OTHER", 897 * 100)).rejects.toThrow(/does not belong/);
    expect((await pay("order_TEST1", 897 * 100)).changed).toBe(true);
    expect((await pay("order_TEST1", 897 * 100)).changed).toBe(false);

    const o = await one<{ status: string; paid_at: string | null }>("select status, paid_at from orders where id = $1", [id]);
    expect(o.status).toBe("paid");
    expect(o.paid_at).not.toBeNull();
    expect((await one<{ stock: number }>("select stock from products where id = $1", [product])).stock).toBe(before - 3);
    expect((await one<{ n: number }>("select count(*)::int n from order_events where order_id = $1 and status = 'paid'", [id])).n).toBe(1);
  });
});

describe("set_order_status", () => {
  it("applies fulfilment fields and logs an event with the actor", async () => {
    const id = await createOrder([{ product_id: await pid("prd_010"), quantity: 1 }]);
    await asRole(db, "service_role", () =>
      db.query("select set_order_status($1, 'placed_on_meesho', $2, 'placed', 'partner@example.com')", [id, { meeshoOrderId: "MS-1", meeshoCost: "120.50" }]),
    );
    const o = await one<{ status: string; meesho_order_id: string; meesho_cost: string; tracking_url: string | null }>("select * from orders where id = $1", [id]);
    expect(o.status).toBe("placed_on_meesho");
    expect(o.meesho_order_id).toBe("MS-1");
    expect(Number(o.meesho_cost)).toBe(120.5);
    expect(o.tracking_url).toBeNull();
    const ev = await one<{ actor: string; note: string }>("select actor, note from order_events where order_id = $1 order by id desc limit 1", [id]);
    expect(ev).toEqual({ actor: "partner@example.com", note: "placed" });
  });

  it("is not callable by signed-in non-service roles", async () => {
    await asRole(db, "authenticated", async () => {
      await expect(db.query("select set_order_status(gen_random_uuid(), 'shipped')")).rejects.toThrow(/permission denied/);
    });
  });
});

describe("row-level security", () => {
  it("lets anon read the public catalogue but not supplier columns", async () => {
    await asRole(db, "anon", async () => {
      expect((await db.query("select id, title, price from products")).rows).toHaveLength(20);
      expect((await db.query("select id from reviews")).rows.length).toBeGreaterThan(0);
      expect((await db.query("select id from search_products('jar')")).rows.length).toBeGreaterThan(0);
      await expect(db.query("select meesho_price from products")).rejects.toThrow(/permission denied/);
      await expect(db.query("select meesho_url from products")).rejects.toThrow(/permission denied/);
    });
  });

  it("blocks anon from orders, customers and order functions", async () => {
    await asRole(db, "anon", async () => {
      await expect(db.query("select * from orders")).rejects.toThrow(/permission denied/);
      await expect(db.query("select * from customers")).rejects.toThrow(/permission denied/);
      await expect(db.query("select public.create_order('{}', '{}', '[]', 499, 49)")).rejects.toThrow(/permission denied/);
      await expect(db.query("select * from mark_order_paid(gen_random_uuid(), null, null, null)")).rejects.toThrow(/permission denied/);
      await expect(db.query("insert into categories (slug, name) values ('x', 'x')")).rejects.toThrow(/permission denied/);
      await expect(db.query("update products set price = 1")).rejects.toThrow(/permission denied/);
    });
  });

  it("shows signed-in non-admins no orders, and admins all orders", async () => {
    const user = "11111111-1111-1111-1111-111111111111";
    const admin = "22222222-2222-2222-2222-222222222222";
    await db.query("insert into auth.users (id) values ($1), ($2)", [user, admin]);
    await db.query("insert into admins (user_id) values ($1)", [admin]);
    const count = () => db.query<{ n: number }>("select count(*)::int n from orders").then((r) => r.rows[0]!.n);
    expect(await asRole(db, "authenticated", count, user)).toBe(0);
    expect(await asRole(db, "authenticated", count, admin)).toBeGreaterThan(0);
  });
});
