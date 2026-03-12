interface TableProps {
  children: React.ReactNode;
}

export function Table({ children }: TableProps) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-[var(--content-border)]">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}
