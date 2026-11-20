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

describe("schema + test catalogue", () => {
  it("loads the test catalogue", async () => {
    expect((await one<{ n: number }>("select count(*)::int n from categories")).n).toBe(11);
    expect((await one<{ n: number }>("select count(*)::int n from products")).n).toBe(7);
    expect((await one<{ n: number }>("select count(*)::int n from product_images")).n).toBe(7);
    expect((await one<{ n: number }>("select count(*)::int n from blog_posts where is_published")).n).toBe(1);
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

describe("products without a subcategory (migration 0007)", () => {
  it("are searchable and orderable, with a /<category>/<product> path", async () => {
    await db.query("update products set subcategory_id = null where legacy_id = 'prd_002'");
    const found = (await db.query<{ slug: string }>("select p.slug from search_products('spin mop') s join products p on p.id = s.id")).rows.map((r) => r.slug);
    expect(found).toContain("spin-mop-bucket-set");
    const id = await createOrder([{ product_id: await pid("prd_002"), quantity: 1 }]);
    const item = await one<{ path: string }>("select path from order_items where order_id = $1", [id]);
    expect(item.path).toBe("/cleaning/spin-mop-bucket-set");
  });
});

describe("saved addresses (migration 0008)", () => {
  it("lets each shopper see and change only their own addresses", async () => {
    const carol = "66666666-6666-6666-6666-666666666666";
    const dave = "77777777-7777-7777-7777-777777777777";
    await db.query("insert into auth.users (id) values ($1), ($2)", [carol, dave]);
    const addr = "('Home', 'Carol R', '9876501234', '12 MG Road, Flat 4B', '', '', 'Pune', 'Maharashtra', '411001', true)";
    const cols = "(label, name, phone, line1, line2, landmark, city, state, pincode, is_default)";
    await asRole(db, "authenticated", () => db.query(`insert into customer_addresses ${cols} values ${addr}`), carol);

    expect((await asRole(db, "authenticated", () => db.query("select id from customer_addresses"), carol)).rows).toHaveLength(1);
    expect((await asRole(db, "authenticated", () => db.query("select id from customer_addresses"), dave)).rows).toHaveLength(0);
    // Dave can't change or delete Carol's address, nor create one in her name.
    expect((await asRole(db, "authenticated", () => db.query("update customer_addresses set city = 'X' returning id"), dave)).rows).toHaveLength(0);
    expect((await asRole(db, "authenticated", () => db.query("delete from customer_addresses returning id"), dave)).rows).toHaveLength(0);
    await expect(asRole(db, "authenticated", () => db.query(`insert into customer_addresses (user_id, ${cols.slice(1)} values ($1, ${addr.slice(1)}`, [carol]), dave)).rejects.toThrow(/row-level security/);
    await asRole(db, "anon", async () => {
      await expect(db.query("select * from customer_addresses")).rejects.toThrow(/permission denied/);
    });
    // Bad data is refused by the database too, and only one default per shopper.
    await expect(asRole(db, "authenticated", () => db.query(`insert into customer_addresses ${cols} values ('', 'Carol R', '12345', '12 MG Road', '', '', 'Pune', 'Maharashtra', '411001', false)`), carol)).rejects.toThrow(/check/);
    await expect(asRole(db, "authenticated", () => db.query(`insert into customer_addresses ${cols} values ${addr}`), carol)).rejects.toThrow(/duplicate key|unique/);
  });
});

describe("reviews and bought counts (migration 0009)", () => {
  it("keeps product rating in line with approved reviews, one review per order item", async () => {
    const p = await pid("prd_003");
    const id = await createOrder([{ product_id: p, quantity: 1 }]);
    const add = (rating: number, approved: boolean, order: string | null) =>
      db.query("insert into reviews (product_id, order_id, author, city, rating, body, is_approved, verified) values ($1, $2, 'Asha R.', 'Pune', $3, 'Good quality item.', $4, true) returning id", [p, order, rating, approved]);
    const first = (await add(4, false, id)).rows[0] as { id: string };
    const stats = () => one<{ rating: string; review_count: number }>("select rating, review_count from products where id = $1", [p]);
    expect((await stats()).review_count).toBe(0);
    await db.query("update reviews set is_approved = true where id = $1", [first.id]);
    expect(await stats()).toMatchObject({ review_count: 1 });
    expect(Number((await stats()).rating)).toBe(4);
    await add(2, true, null);
    expect(Number((await stats()).rating)).toBe(3);
    await expect(add(5, true, id)).rejects.toThrow(/duplicate key|unique/);
    await db.query("delete from reviews where id = $1", [first.id]);
    expect(await stats()).toMatchObject({ review_count: 1 });
  });

  it("counts an order as bought once paid, and not after it's cancelled", async () => {
    const p = await pid("prd_011");
    const bought = async () => (await one<{ bought_count: number }>("select bought_count from products where id = $1", [p])).bought_count;
    const before = await bought();
    const id = await createOrder([{ product_id: p, quantity: 2 }]);
    expect(await bought()).toBe(before);
    await db.query("update orders set status = 'paid' where id = $1", [id]);
    expect(await bought()).toBe(before + 1);
    await db.query("update orders set status = 'shipped' where id = $1", [id]);
    expect(await bought()).toBe(before + 1);
    await db.query("update orders set status = 'cancelled_refunded' where id = $1", [id]);
    expect(await bought()).toBe(before);
    await asRole(db, "anon", async () => {
      expect((await db.query("select bought_count, rating, review_count from products limit 1")).rows).toHaveLength(1);
    });
  });
});

describe("clothing sizes (migration 0010)", () => {
  it("requires a valid size for sized products, keeps sizes as separate lines, and checks stock per product", async () => {
    const shirt = await pid("prd_004");
    const plain = await pid("prd_010");
    await db.query("update products set sizes = '{S,M,L}', stock = 3 where id = $1", [shirt]);
    const order = (items: object[]) => createOrder(items as { product_id: string; quantity: number }[]);

    await expect(order([{ product_id: shirt, quantity: 1 }])).rejects.toThrow(/Choose a size/);
    await expect(order([{ product_id: shirt, quantity: 1, size: "XXL" }])).rejects.toThrow(/not available/);
    await expect(order([{ product_id: plain, quantity: 1, size: "M" }])).rejects.toThrow(/does not come in sizes/);
    await expect(order([{ product_id: shirt, quantity: 2, size: "M" }, { product_id: shirt, quantity: 2, size: "L" }])).rejects.toThrow(/out of stock/);

    const id = await order([{ product_id: shirt, quantity: 1, size: "M" }, { product_id: shirt, quantity: 1, size: "L" }, { product_id: shirt, quantity: 1, size: "M" }]);
    const items = (await db.query<{ size: string; quantity: number }>("select size, quantity from order_items where order_id = $1 order by size", [id])).rows;
    expect(items).toEqual([{ size: "L", quantity: 1 }, { size: "M", quantity: 2 }]);
    await asRole(db, "anon", async () => {
      expect((await db.query("select sizes from products limit 1")).rows).toHaveLength(1);
    });
    await db.query("update products set sizes = '{}', stock = 50 where id = $1", [shirt]);
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

describe("CMS tables (migration 0004)", () => {
  it("lets anyone read site content but only the service role write it", async () => {
    await db.query(`insert into site_content (key, value) values ('settings', '{"care":{"phone":"+91 1"}}')`);
    await asRole(db, "anon", async () => {
      expect((await db.query("select key from site_content")).rows).toHaveLength(1);
      await expect(db.query(`insert into site_content (key, value) values ('home', '{}')`)).rejects.toThrow(/permission denied/);
      await expect(db.query(`update site_content set value = '{}'`)).rejects.toThrow(/permission denied/);
      await expect(db.query("select * from admin_activity")).rejects.toThrow(/permission denied/);
      expect((await db.query("select id, is_new from products limit 1")).rows).toHaveLength(1);
      // Migration 0014: shoppers can read the trust labels shown on cards.
      expect((await db.query("select country_of_origin, quality_certified from products limit 1")).rows).toHaveLength(1);
    });
    await asRole(db, "service_role", () => db.query(`insert into site_content (key, value) values ('page:about', '{}')`));
    await expect(db.query(`insert into site_content (key, value) values ('Bad Key!', '{}')`)).rejects.toThrow(/check/);
  });

  it("hides inactive categories from the public", async () => {
    await db.query("update categories set is_active = false where slug = 'door-window'");
    const visible = await asRole(db, "anon", () => db.query<{ slug: string }>("select slug from categories"));
    expect(visible.rows.map((r) => r.slug)).not.toContain("door-window");
    await db.query("update categories set is_active = true where slug = 'door-window'");
  });
});

describe("customer accounts and admin roles (migration 0005)", () => {
  it("lets a signed-in customer read only their own orders", async () => {
    const alice = "33333333-3333-3333-3333-333333333333";
    const bob = "44444444-4444-4444-4444-444444444444";
    await db.query("insert into auth.users (id) values ($1), ($2)", [alice, bob]);
    const id = await createOrder([{ product_id: await pid("prd_010"), quantity: 1 }]);
    await db.query("update orders set user_id = $1 where id = $2", [alice, id]);

    const mine = await asRole(db, "authenticated", () => db.query("select id from orders"), alice);
    expect(mine.rows).toEqual([{ id }]);
    const items = await asRole(db, "authenticated", () => db.query("select id from order_items"), alice);
    expect(items.rows.length).toBe(1);
    expect((await asRole(db, "authenticated", () => db.query("select id from orders"), bob)).rows).toHaveLength(0);
    await asRole(db, "authenticated", async () => {
      await expect(db.query("update orders set total = 1")).rejects.toThrow(/permission denied/);
      await expect(db.query("insert into admins (user_id) values ($1)", [alice])).rejects.toThrow(/permission denied/);
      await expect(db.query("select * from auth_attempts")).rejects.toThrow(/permission denied/);
    }, alice);
  });

  it("validates admin roles and permissions", async () => {
    const u = "55555555-5555-5555-5555-555555555555";
    await db.query("insert into auth.users (id) values ($1)", [u]);
    await expect(db.query("insert into admins (user_id, role) values ($1, 'owner')", [u])).rejects.toThrow(/check/);
    await expect(db.query("insert into admins (user_id, permissions) values ($1, '{hack}')", [u])).rejects.toThrow(/check/);
    await db.query("insert into admins (user_id, permissions) values ($1, '{orders,reviews}')", [u]);
    expect((await one<{ role: string }>("select role from admins where user_id = $1", [u])).role).toBe("admin");
  });
});

describe("admin sign-in codes (migration 0006)", () => {
  it("keeps codes out of reach of browser keys", async () => {
    for (const role of ["anon", "authenticated"] as const) {
      await asRole(db, role, async () => {
        await expect(db.query("select * from admin_login_codes")).rejects.toThrow(/permission denied/);
        await expect(db.query("delete from admin_login_codes")).rejects.toThrow(/permission denied/);
      });
    }
  });
});

describe("row-level security", () => {
  it("lets anon read the public catalogue but not supplier columns", async () => {
    await asRole(db, "anon", async () => {
      expect((await db.query("select id, title, price from products")).rows).toHaveLength(7);
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


describe("site logs and presence (migration 0015)", () => {
  it("keeps logs and visitor pings private to the server", async () => {
    await asRole(db, "service_role", async () => {
      await db.query(`insert into site_logs (level, source, path, message) values ('error', 'browser', '/cart', 'TypeError: x')`);
      await db.query(`insert into site_presence (session_id, path) values ('abcdef123456', '/')`);
    });
    for (const role of ["anon", "authenticated"] as const) {
      await asRole(db, role, async () => {
        await expect(db.query("select * from site_logs")).rejects.toThrow(/permission denied/);
        await expect(db.query("select * from site_presence")).rejects.toThrow(/permission denied/);
        await expect(db.query(`insert into site_logs (level, source, message) values ('error', 'server', 'fake')`)).rejects.toThrow(/permission denied/);
      });
    }
    await expect(db.query(`insert into site_logs (level, source, message) values ('fatal', 'server', 'x')`)).rejects.toThrow(/check/);
    await expect(db.query(`insert into site_presence (session_id) values ('short')`)).rejects.toThrow(/check/);
  });
});
