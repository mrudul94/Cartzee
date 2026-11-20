import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { StatCard } from "@/components/admin/AdminBits";
import { Badge } from "@/components/ui/Badge";
import { ChipNav } from "@/components/ui/ChipNav";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { requireSuperAdmin } from "@/lib/auth/admin";
import { listActivity } from "@/lib/data/content-repo";
import { errorCounts, listLogs, presenceNow, type LogLevel, type LogSource, type SiteLog } from "@/lib/site-log";
import { paths } from "@/lib/utils/paths";

export const metadata = { title: "Site logs" };
export const dynamic = "force-dynamic";

const RANGES = { "24h": 24, "7d": 24 * 7, "30d": 24 * 30 } as const;
type Range = keyof typeof RANGES;

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", second: "2-digit" });
const LEVEL_BADGE: Record<LogLevel, "error" | "warning" | "neutral"> = { error: "error", warn: "warning", info: "neutral" };

/** Super Admin only: visitors right now, shop crashes/errors (server and browser) and the admin activity log. */
export default async function SiteLogsPage({ searchParams }: { searchParams: Promise<{ level?: string; source?: string; range?: string }> }) {
  await requireSuperAdmin();
  const sp = await searchParams;
  const level = (["error", "warn"] as const).find((l) => l === sp.level);
  const source = (["server", "browser"] as const).find((s) => s === sp.source);
  const range: Range = sp.range && sp.range in RANGES ? (sp.range as Range) : "7d";

  const [visitors, counts, logs, activity] = await Promise.all([
    presenceNow(),
    errorCounts(),
    listLogs({ level, source, sinceHours: RANGES[range] }),
    listActivity(50),
  ]);

  const href = (next: { level?: LogLevel; source?: LogSource; range?: Range }) => {
    const q = new URLSearchParams();
    const v = { level, source, range, ...next };
    if (v.level) q.set("level", v.level);
    if (v.source) q.set("source", v.source);
    if (v.range !== "7d") q.set("range", v.range);
    const s = q.toString();
    return paths.admin(`/logs${s ? `?${s}` : ""}`);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">Site logs</h1>
        <p className="text-text-muted">Who is on the shop now, crashes and errors from the shop, and changes made in the admin.</p>
        <AutoRefresh seconds={30} />
      </div>

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Visitors now" value={visitors.total} hint="Open shop tabs in the last 2 minutes" tone={visitors.total > 0 ? "success" : "default"} />
        <StatCard label="Errors (24 hours)" value={counts.day} tone={counts.day > 0 ? "warning" : "default"} />
        <StatCard label="Errors (7 days)" value={counts.week} />
      </section>

      <section aria-labelledby="pages-heading">
        <SectionHeader id="pages-heading" title="Pages being viewed now" />
        <DataTable
          caption="Shop pages open right now"
          rows={visitors.pages}
          rowKey={(p) => p.path}
          empty="No one is on the shop right now."
          columns={[
            { header: "Page", cell: (p) => <span className="break-all">{p.path}</span> },
            { header: "Visitors", cell: (p) => p.count, align: "right" },
          ]}
        />
      </section>

      <section aria-labelledby="errors-heading" className="flex flex-col gap-4">
        <SectionHeader id="errors-heading" title="Errors and crashes" subtitle="Server: the shop failed to build a page or answer a request. Browser: a page crashed or a script failed on a shopper's device." />
        <div className="flex flex-col gap-2">
          <ChipNav
            label="Time range"
            chips={(Object.keys(RANGES) as Range[]).map((r) => ({ label: r === "24h" ? "Last 24 hours" : r === "7d" ? "Last 7 days" : "Last 30 days", href: href({ range: r }), active: r === range }))}
          />
          <ChipNav
            label="Where"
            chips={[
              { label: "Everywhere", href: href({ source: undefined }), active: !source },
              { label: "Server", href: href({ source: "server" }), active: source === "server" },
              { label: "Browser", href: href({ source: "browser" }), active: source === "browser" },
            ]}
          />
        </div>
        <DataTable<SiteLog>
          caption="Shop errors, newest first"
          rows={logs}
          rowKey={(l) => String(l.id)}
          empty="No errors in this period."
          columns={[
            { header: "When", cell: (l) => <span className="whitespace-nowrap">{when(l.at)}</span> },
            { header: "Type", cell: (l) => <Badge variant={LEVEL_BADGE[l.level]}>{l.level}</Badge>, hideOnMobile: true },
            { header: "Where", cell: (l) => (l.source === "server" ? "Server" : "Browser"), hideOnMobile: true },
            { header: "Page", cell: (l) => <span className="break-all">{l.path || "—"}</span> },
            {
              header: "What happened",
              cell: (l) => (
                <details className="min-w-64">
                  <summary className="cursor-pointer break-words">{l.message}</summary>
                  <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-md bg-background p-3 text-xs">{[l.detail, l.userAgent && `Browser: ${l.userAgent}`].filter(Boolean).join("\n\n") || "No more details."}</pre>
                </details>
              ),
            },
          ]}
        />
        <p className="text-sm text-text-muted">
          Errors are kept for 30 days. Failures inside Cloudflare itself (for example &ldquo;exceeded CPU time limit&rdquo;) stop the shop before it can log them; see them in the Cloudflare dashboard under Workers → cartzee-shop → Logs.
        </p>
      </section>

      <section aria-labelledby="activity-heading">
        <SectionHeader id="activity-heading" title="Admin activity" subtitle="The last 50 changes made in the admin." />
        <DataTable
          caption="Recent admin changes"
          rows={activity}
          rowKey={(a) => String(a.id)}
          empty="No admin activity yet."
          columns={[
            { header: "When", cell: (a) => <span className="whitespace-nowrap">{when(a.at)}</span> },
            { header: "Who", cell: (a) => <span className="break-all">{a.actor}</span>, hideOnMobile: true },
            { header: "What", cell: (a) => a.action },
            { header: "Item", cell: (a) => <span className="break-all">{a.target || "—"}</span>, hideOnMobile: true },
          ]}
        />
      </section>
    </div>
  );
}
