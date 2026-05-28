import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export const metadata: Metadata = {
  title: "OpenClaw",
  description: "Tool taxonomy system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-deep text-primary min-h-screen font-sans">
        <Sidebar />
        <Topbar />
        <main className="ml-[220px] mt-[60px] min-h-[calc(100vh-60px)]">
          {children}
        </main>
      </body>
    </html>
  );
}
