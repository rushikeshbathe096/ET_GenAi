"use client";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Responsive Sidebar - Only visible in dashboard pages */}
      <div className="hidden lg:flex h-full shrink-0">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,#121b4f_0%,#071024_42%,#050913_100%)] p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
