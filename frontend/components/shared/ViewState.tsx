import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { ReactNode } from "react";

type ViewStateVariant = "loading" | "empty" | "error";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface ViewStateProps {
  variant: ViewStateVariant;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  /** Optional custom icon component (overrides default) */
  icon?: ReactNode;
  /** Optional custom illustration/SVG slot */
  illustration?: ReactNode;
  /** Semantic heading level for the title (default: h3) */
  headingLevel?: HeadingLevel;
}

const iconByVariant: Record<ViewStateVariant, ReactNode> = {
  loading: <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />,
  empty: <Inbox className="h-6 w-6 text-muted-foreground" aria-hidden="true" />,
  error: <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />,
};

export function ViewState({
  variant,
  title,
  description,
  action,
  className,
  icon,
  illustration,
  headingLevel = "h3",
}: ViewStateProps) {
  const role = variant === "error" ? "alert" : "status";
  const HeadingTag = headingLevel as keyof JSX.IntrinsicElements;

  return (
    <div
      role={role}
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center ${className ?? ""}`}
    >
      {/* Custom illustration slot or default icon */}
      {illustration ? (
        <div className="mb-2">{illustration}</div>
      ) : (
        icon ?? iconByVariant[variant]
      )}
      
      <div className="space-y-1">
        <HeadingTag className="text-sm font-semibold">{title}</HeadingTag>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
