import type { StatementStatus } from "../types";
import { Tooltip } from "./Tooltip";

const labels: Record<StatementStatus, string> = {
  MISSING: "Missing",
  UPLOADED: "Current",
  OUTDATED: "Outdated",
};

const variants: Record<StatementStatus, string> = {
  MISSING: "bg-[#f8e8e6] text-[#a24840]",
  UPLOADED: "bg-[#e8f3eb] text-[#276c4a]",
  OUTDATED: "bg-[#fff1da] text-[#91601a]",
};

const guidance: Partial<Record<StatementStatus, string>> = {
  MISSING: "No statement has been added. Upload a statement to continue.",
  UPLOADED: "This statement is recent and ready to submit.",
  OUTDATED:
    "This statement is more than three months old. Replace it with a recent statement.",
};

export function StatusBadge({ status }: { status: StatementStatus }) {
  const badge = (
    <span
      className={`col-start-2 flex w-max min-w-[83px] items-center gap-[7px] rounded-full px-[9px] py-[5px] text-[11px] font-bold min-[701px]:col-auto ${variants[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {labels[status]}
    </span>
  );

  return guidance[status] ? (
    <Tooltip content={guidance[status]}>{badge}</Tooltip>
  ) : (
    badge
  );
}
