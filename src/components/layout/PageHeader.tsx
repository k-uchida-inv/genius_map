import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  children?: ReactNode;
};

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1
        className="text-2xl font-semibold"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h1>
      {children}
    </div>
  );
}
