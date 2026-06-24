import React from "react";
import { useTheme } from "../ui/ThemeContext";
import { Navbar } from "./Navbar";

// ---- Types ----

interface ViewShellProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "default" | "wide" | "full";
  loading?: boolean;
  padded?: boolean;
}

// ---- Max-width presets (px) ----

const maxWidthMap: Record<string, string> = {
  default: "max-w-5xl",
  wide: "max-w-7xl",
  full: "max-w-full",
};

// ---- Skeleton ----

function SkeletonContent({ tokens }: { tokens: ReturnType<typeof useTheme>["tokens"] }) {
  return (
    <div aria-hidden="true" className="animate-pulse space-y-4 p-6">
      <div className="h-8 w-2/5 rounded" style={{ background: tokens.shimmerBase }} />
      <div className="h-4 w-4/5 rounded" style={{ background: tokens.shimmerHighlight }} />
      <div className="h-4 w-3/5 rounded" style={{ background: tokens.shimmerHighlight }} />
      <div className="space-y-2 pt-2">
        <div className="h-3 w-full rounded" style={{ background: tokens.shimmerBase }} />
        <div className="h-3 w-11/12 rounded" style={{ background: tokens.shimmerBase }} />
        <div className="h-3 w-10/12 rounded" style={{ background: tokens.shimmerBase }} />
      </div>
      <div className="flex gap-3 pt-2">
        <div className="h-9 w-24 rounded" style={{ background: tokens.shimmerHighlight }} />
        <div className="h-9 w-20 rounded" style={{ background: tokens.shimmerHighlight }} />
      </div>
    </div>
  );
}

// ---- Component ----

export function ViewShell({
  children,
  className = "",
  maxWidth = "default",
  loading = false,
  padded = true,
}: ViewShellProps) {
  const { tokens: t } = useTheme();
  const maxWidthClass = maxWidthMap[maxWidth] || maxWidthMap.default;

  const outerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 auto",
    minHeight: 0,
    backgroundColor: t.bg,
    fontFamily: "'DM Sans', sans-serif",
  };

  const innerStyle: React.CSSProperties = {
    flex: "1 1 auto",
    width: "100%",
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  };

  return (
    <div style={outerStyle} className={`min-h-0 flex-1 flex flex-col ${className}`}>
      <Navbar />
      <div
        style={innerStyle}
        className={`
          mx-auto
          w-full
          ${maxWidthClass}
          ${padded ? "px-4 sm:px-6 lg:px-8" : ""}
        `}
      >
        {loading ? (
          <SkeletonContent tokens={t} />
        ) : (
          <div className="flex-1 flex flex-col min-h-0 py-4 sm:py-6">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewShell;
