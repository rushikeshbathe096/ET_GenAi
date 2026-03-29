import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { AlertProvider } from "../context/AlertContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Opportunity Radar",
  description: "AI-Powered Stock Intelligence System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-[#030814] text-slate-100 flex overflow-hidden">
        <AlertProvider>
          {/* Responsive Sidebar */}
          <div className="hidden lg:flex h-full shrink-0">
            <Sidebar />
          </div>
          
          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,#121b4f_0%,#071024_42%,#050913_100%)] p-4 md:p-8">
              {children}
            </main>
          </div>
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              style: {
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "14px",
                background: "#0c1532",
                color: "#fff",
                border: "1px solid rgba(99,102,241,0.2)",
              },
            }}
          />
        </AlertProvider>
      </body>
    </html>
  );
}
