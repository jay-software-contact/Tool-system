import React from "react";
import { useTheme } from "../../components/ui/ThemeContext";

// ---- Types ----

/**
 * @typedef {Object} ViewShellProps
 * @property {React.ReactNode} children - Main content to wrap
 * @property {string} [className] - Additional className for the outer wrapper
 * @property {"default" | "wide" | "full"} [maxWidth] - Max-width preset; defaults to "default"
 * @property {boolean} [loading] - When true, renders a skeleton placeholder
 * @property {boolean} [padded] - When false, removes inner padding; defaults to true
 */

// ---- Max-width presets (px) ----

const maxWidthMap = {
  default: "max-w-5xl",
  wide: "max-w-7xl",
  full: "max-w-full",
};

// ---- Skeleton ----

function SkeletonContent({ tokens }) {
  return (
    <div aria-hidden="true" className="animate-pulse space-y-4 p-6">
      <div
        className="h-8 w-2/5 rounded"
        style={{ background: tokens.shimmerBase }}
      />
      <div
        className="h-4 w-4/5 rounded"
        style={{ background: tokens.shimmerHighlight }}
      />
      <div
        className="h-4 w-3/5 rounded"
        style={{ background: tokens.shimmerHighlight }}
      />
      <div className="space-y-2 pt-2">
        <div
          className="h-3 w-full rounded"
          style={{ background: tokens.shimmerBase }}
        />
        <div
          className="h-3 w-11/12 rounded"
          style={{ background: tokens.shimmerBase }}
        />
        <div
          className="h-3 w-10/12 rounded"
          style={{ background: tokens.shimmerBase }}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <div
          className="h-9 w-24 rounded"
          style={{ background: tokens.shimmerHighlight }}
        />
        <div
          className="h-9 w-20 rounded"
          style={{ background: tokens.shimmerHighlight }}
        />
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
}) {
  const { tokens } = useTheme();
  const t = tokens;

  const maxWidthClass = maxWidthMap[maxWidth] || maxWidthMap.default;

  // Outer wrapper: full-height flex column, themed background
  const outerStyle = {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 auto",
    minHeight: 0,
    backgroundColor: t.bg,
    fontFamily: "'DM Sans', sans-serif",
  };

  // Inner wrapper: centered, max-width, responsive padding
  const innerStyle = {
    flex: "1 1 auto",
    width: "100%",
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  };

  // Padding style — responsive via inline breakpoints isn't possible,
  // so we use a CSS custom property approach with a <style> tag.
  // Tailwind handles the responsive padding via className instead.

  return (
    <div style={outerStyle} className={`min-h-0 flex-1 flex flex-col ${className}`}>
      {/* Responsive padding wrapper — Tailwind handles breakpoints */}
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
