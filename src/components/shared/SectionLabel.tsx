import type { ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <p className="font-sans text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-5">
      {children}
    </p>
  );
}
