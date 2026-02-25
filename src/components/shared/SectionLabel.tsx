import type { ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <p className="font-sans text-[11px] font-semibold text-muted-foreground/70 tracking-widest uppercase mb-4">
      {children}
    </p>
  );
}
