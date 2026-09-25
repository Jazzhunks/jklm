import { cn } from "@/lib/utils";

export default function AdminDatePicker({ label, error, id, className, ...props }) {
  const inputId = id || props.name;
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <label htmlFor={inputId} className="text-sm font-medium text-foreground">{label}</label>}
      {/* ponytail: browser native date picker is sufficient, skips react-day-picker and popover boilerplate */}
      <input type="date" id={inputId} className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", error && "border-rose-500 focus-visible:ring-rose-500")} {...props} />
      {error && <p className="text-xs text-rose-600" role="alert">{error}</p>}
    </div>
  );
}
