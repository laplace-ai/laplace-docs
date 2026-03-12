import { Info, Lightbulb, AlertTriangle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutType = "info" | "tip" | "warning" | "danger";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const calloutConfig: Record<
  CalloutType,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    bgVar: string;
    borderVar: string;
    iconColor: string;
  }
> = {
  info: {
    icon: Info,
    label: "Info",
    bgVar: "var(--callout-info-bg)",
    borderVar: "var(--callout-info-border)",
    iconColor: "var(--info)",
  },
  tip: {
    icon: Lightbulb,
    label: "Tip",
    bgVar: "var(--callout-tip-bg)",
    borderVar: "var(--callout-tip-border)",
    iconColor: "var(--success)",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    bgVar: "var(--callout-warning-bg)",
    borderVar: "var(--callout-warning-border)",
    iconColor: "var(--warning)",
  },
  danger: {
    icon: AlertOctagon,
    label: "Danger",
    bgVar: "var(--callout-danger-bg)",
    borderVar: "var(--callout-danger-border)",
    iconColor: "var(--error)",
  },
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn("my-6 rounded-lg p-4 not-prose")}
      style={{
        backgroundColor: config.bgVar,
        borderLeft: `3px solid ${config.borderVar}`,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 shrink-0"
          style={{ color: config.iconColor }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex-1 min-w-0">
          {title && (
            <p
              className="font-semibold text-sm mb-1"
              style={{ color: config.iconColor }}
            >
              {title}
            </p>
          )}
          <div className="text-sm text-[var(--content-text-primary)] [&>p]:mb-2 [&>p:last-child]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
