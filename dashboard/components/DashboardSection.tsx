import React from "react";

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export default function DashboardSection({
  title,
  children,
  className = "",
  titleClassName = "",
}: DashboardSectionProps) {
  return (
    <section className={className} aria-label={title}>
      <h2 className={`sr-only ${titleClassName}`}>{title}</h2>
      {children}
    </section>
  );
}
