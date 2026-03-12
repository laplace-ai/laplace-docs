import React from "react";

interface StepsProps {
  children: React.ReactNode;
}

interface StepProps {
  title: string;
  children: React.ReactNode;
  stepNumber?: number;
}

export function Steps({ children }: StepsProps) {
  // Enumerate children to pass step numbers
  const steps = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child)
  );

  return (
    <div className="my-6 not-prose">
      <div className="space-y-0">
        {steps.map((child, index) => {
          if (React.isValidElement<StepProps>(child)) {
            return React.cloneElement(child, {
              stepNumber: index + 1,
              key: index,
            });
          }
          return child;
        })}
      </div>
    </div>
  );
}

export function Step({ title, children, stepNumber }: StepProps) {
  return (
    <div className="relative pl-10 pb-8 last:pb-0 group">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-8 bottom-0 w-px bg-[var(--content-border)] group-last:hidden" />

      {/* Step number circle */}
      <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--blue-primary)] bg-[var(--bg-base)] text-sm font-semibold text-[var(--blue-primary)]">
        {stepNumber ?? 1}
      </div>

      {/* Content */}
      <div className="pt-0.5">
        <h4 className="font-semibold text-[var(--content-text-primary)] mb-2">
          {title}
        </h4>
        <div className="text-sm text-[var(--content-text-secondary)] [&>p]:mb-2 [&>p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  );
}
