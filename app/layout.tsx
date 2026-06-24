import React from "react";
import { ThemeProvider } from "../components/ui/ThemeContext";
import { ViewShell } from "../components/layout/ViewShell";

export const metadata = {
  title: "the-System",
  description: "Tool management platform with aesthetic taxonomy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#1a1a2e",
          color: "#e0e0e0",
          fontFamily: "'DM Sans', 'Inter', sans-serif",
          minHeight: "100vh",
        }}
      >
        <ThemeProvider initialTheme="metal-heart">
          <ViewShell>{children}</ViewShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
