import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
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
          {children}
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
