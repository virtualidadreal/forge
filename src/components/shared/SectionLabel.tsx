import type { ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <p className="font-sans text-xs font-medium text-muted-foreground tracking-[0.2em] uppercase mb-6">
      {children}
    </p>
  );
}
