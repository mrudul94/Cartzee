import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  /** Hide below the md breakpoint to keep tables readable on phones. */
  hideOnMobile?: boolean;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption: string;
  empty?: ReactNode;
  className?: string;
};

const align = { left: "text-left", right: "text-right", center: "text-center" };

/** Accessible data table for admin lists (orders, products). Horizontal scroll on small screens. */
export function DataTable<T>({ columns, rows, rowKey, caption, empty = "Nothing here yet.", className }: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border bg-surface", className)}>
      <table className="w-full border-collapse text-base">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-background text-sm text-text-muted">
          <tr>
            {columns.map((c) => (
              <th key={c.header} scope="col" className={cn("whitespace-nowrap px-4 py-3 font-semibold", align[c.align ?? "left"], c.hideOnMobile && "hidden md:table-cell")}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-text-muted">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={rowKey(r)} className="border-t border-border align-top hover:bg-background">
                {columns.map((c) => (
                  <td key={c.header} className={cn("px-4 py-3", align[c.align ?? "left"], c.hideOnMobile && "hidden md:table-cell")}>
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
