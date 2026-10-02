import { cn } from "@/lib/cn";

export function PositionTable({
  title,
  columns,
  rows,
  empty,
}: {
  title: string;
  columns: { key: string; header: string; align?: "left" | "right" }[];
  rows: { id: string; cells: Record<string, React.ReactNode> }[];
  empty: string;
}) {
  return (
    <section className="mt-14">
      <h2 className="text-[22px] tracking-[-0.02em] text-ivory">{title}</h2>
      <div className="mt-5 overflow-x-auto border-t border-line">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-line">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "py-3 text-[10px] font-medium tracking-[0.16em] text-muted uppercase",
                    column.align === "right" && "text-right",
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-[14px] text-muted">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-line-subtle">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "h-14 text-[14px] text-ivory tabular-nums",
                        column.align === "right" && "text-right",
                      )}
                    >
                      {row.cells[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
