import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { Badge } from "@/components/ui/Badge";
import registry from "@/design-system/registry.json";
import { color, font, radius, shadow, space, type ColorToken } from "@/design-system/tokens";
import { tokenStyle } from "@/lib/utils/token-style";
import { demos } from "./demos";

type Entry = (typeof registry.components)[number];
const ORDER = ["ui/", "commerce", "section", "layout", "admin"];

/** Living style guide: every registry entry with its variants. Rendered at /design-system (dev) and /admin/design-system. */
export function DesignSystemView({ embedded = false }: { embedded?: boolean }) {

  const visual = registry.components.filter((e) => ORDER.some((o) => e.category.startsWith(o)));
  const code = registry.components.filter((e) => !ORDER.some((o) => e.category.startsWith(o)));
  const groups = ORDER.map((o) => ({ key: o.replace("/", ""), items: visual.filter((e) => e.category.startsWith(o)) }));

  return (
    <div className={embedded ? "" : "min-h-screen bg-background"}>
      <header className={embedded ? "hidden" : "border-b border-border bg-surface"}>
        <Container className="flex items-center justify-between py-3">
          <Logo />
          <p className="text-sm text-text-muted">{registry.components.length} registered entries</p>
        </Container>
      </header>
      <Container width={embedded ? "full" : "default"} className={embedded ? "grid gap-10 px-0 md:px-0 lg:grid-cols-5" : "grid gap-10 py-10 lg:grid-cols-5"}>
        <nav aria-label="Registry" className="lg:sticky lg:top-6 lg:max-h-screen lg:self-start lg:overflow-y-auto">
          <ul className="flex flex-col gap-4 text-sm">
            <li><a href="#tokens" className="font-semibold hover:underline">Tokens</a></li>
            {groups.map((g) => (
              <li key={g.key}>
                <p className="mb-1 font-semibold uppercase tracking-wider text-text-muted">{g.key}</p>
                <ul className="flex flex-col">
                  {g.items.map((e) => (
                    <li key={e.name}><a href={`#${e.name}`} className="inline-flex min-h-9 items-center hover:underline">{e.name}</a></li>
                  ))}
                </ul>
              </li>
            ))}
            <li><a href="#code" className="font-semibold hover:underline">Hooks, utils & SEO</a></li>
          </ul>
        </nav>

        <div className="flex flex-col gap-12 lg:col-span-4">
          <h1 className="font-heading text-4xl font-semibold">Cartzee design system</h1>
          <section id="tokens" className="flex flex-col gap-8">
            <h2 className="font-heading text-3xl font-semibold">Tokens</h2>
            <div>
              <h3 className="mb-3 font-semibold">Colour</h3>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {(Object.keys(color) as ColorToken[]).map((k) => (
                  <li key={k} className="overflow-hidden rounded-md border border-border bg-surface">
                    <span className="block h-16" style={tokenStyle({ bg: k })} />
                    <span className="block p-2 text-sm"><strong>{k}</strong><br /><span className="text-text-muted">{color[k]}</span></span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-semibold">Type scale</h3>
              <ul className="flex flex-col gap-1">
                {Object.entries(font.size).map(([k, [size, lh]]) => (
                  <li key={k} className="flex items-baseline gap-4">
                    <span className="w-24 text-sm text-text-muted">{k} · {size} / {lh}</span>
                    <span style={{ fontSize: `var(--text-${k})` }} className="font-heading">Home needs, honestly priced</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <h3 className="mb-3 font-semibold">Spacing</h3>
                <ul className="flex flex-col gap-1 text-sm">
                  {(["1", "2", "3", "4", "6", "8", "12", "16"] as const).map((k) => (
                    <li key={k} className="flex items-center gap-2">
                      <span className="w-12 text-text-muted">{k}</span>
                      <span className="h-3 rounded-sm bg-primary" style={tokenStyle({ width: k as keyof typeof space })} />
                      <span className="text-text-muted">{space[k as keyof typeof space]}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-3 font-semibold">Radius</h3>
                <ul className="flex flex-wrap gap-3">
                  {Object.keys(radius).map((k) => (
                    <li key={k} className="flex h-16 w-16 items-center justify-center border border-border-strong bg-surface text-xs" style={{ borderRadius: `var(--radius-${k})` }}>{k}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-3 font-semibold">Shadow</h3>
                <ul className="flex flex-wrap gap-3">
                  {Object.keys(shadow).map((k) => (
                    <li key={k} className="flex h-16 w-16 items-center justify-center rounded-md bg-surface text-xs" style={{ boxShadow: `var(--shadow-${k})` }}>{k}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {groups.map((g) => (
            <section key={g.key} className="flex flex-col gap-8">
              <h2 className="font-heading text-3xl font-semibold capitalize">{g.key}</h2>
              {g.items.map((e) => <EntryCard key={e.name} e={e} />)}
            </section>
          ))}

          <section id="code" className="flex flex-col gap-4">
            <h2 className="font-heading text-3xl font-semibold">Hooks, utils & SEO helpers</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {code.map((e) => (
                <li key={e.name} id={e.name} className="rounded-md border border-border bg-surface p-4">
                  <p className="font-semibold">{e.name} <Badge className="ml-2">{e.category}</Badge></p>
                  <p className="mt-1 text-sm text-text-muted">{e.description}</p>
                  <code className="mt-2 block text-sm">{e.example}</code>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>
    </div>
  );
}

function EntryCard({ e }: { e: Entry }) {
  return (
    <article id={e.name} className="scroll-mt-6 overflow-hidden rounded-lg border border-border bg-surface">
      <header className="flex flex-col gap-1 border-b border-border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-xl font-semibold">{e.name}</h3>
          <Badge>{e.category}</Badge>
          <code className="text-sm text-text-muted">{e.path}</code>
        </div>
        <p className="text-text-muted">{e.description}</p>
        {e.variants.length > 0 && <p className="text-sm"><strong>Variants:</strong> {e.variants.join(", ")}</p>}
        {e.usedIn.length > 0 && <p className="text-sm"><strong>Used in:</strong> {e.usedIn.join(", ")}</p>}
      </header>
      <div className="p-4">{demos[e.name] ?? <p className="text-error">Missing demo</p>}</div>
    </article>
  );
}
