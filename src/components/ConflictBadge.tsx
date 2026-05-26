interface ConflictBadgeProps {
  label: string;
  tone?: "neutral" | "warning" | "danger";
}

const toneClasses: Record<NonNullable<ConflictBadgeProps["tone"]>, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  warning: "bg-amber-100 text-amber-800 ring-amber-200",
  danger: "bg-rose-100 text-rose-800 ring-rose-200"
};

export function ConflictBadge({ label, tone = "neutral" }: ConflictBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
