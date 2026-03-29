import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardLayout({ children, className = "" }: DashboardLayoutProps) {
  return <div className={`w-full max-w-7xl mx-auto space-y-4 lg:space-y-5 ${className}`}>{children}</div>;
}
