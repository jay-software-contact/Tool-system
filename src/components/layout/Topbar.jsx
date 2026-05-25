import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../components/ui/ThemeContext";

// ---- Types ----

export interface TopbarProps {
  /** Appwrite endpoint used for connection health check */
  appwriteEndpoint?: string;
  /** Called when the search overlay should open */
  onSearchOpen?: () => void;
  /** Called when the add button is clicked */
  onAdd?: () => void;
  /** Additional className for the wrapper */
  className?: string;
  /** When true, the entire topbar is non-interactive */
  disabled?: boolean;
  /** When true, shows skeleton/loading placeholders */
  loading?: boolean;
  /** Override connection status externally */
  connectionStatus?: "connected" | "disconnected" | "checking";
}

// ---- Helpers ----

function useConnectionStatus(
  endpoint: string,
  override?: "connected" | "disconnected" | "checking"
): "connected" | "disconnected" | "checking" {
  const [status, setStatus] = useState<"connected" | "disconnected" | "checking">(
    "checking"
  );

  useEffect(() => {
    if (override !== undefined) {
      setStatus(override);
      return;
    }
    if (!endpoint) {
      setStatus("disconnected");
      return;
    }

    let cancelled = false;
    const check = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(endpoint, {
          method: "HEAD",
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!cancelled) {
          setStatus(res.ok ? "connected" : "disconnected");
        }
      } catch {
        if (!cancelled) setStatus("disconnected");
      }
    };

    check();
    const id = setInterval(check, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [endpoint, override]);

  return status;
}

// ---- Skeleton ----

function SkeletonBar({ tokens }: { tokens: ReturnType<typeof useTheme>["tokens"] }) {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "48px",
        padding: "0 16px",
        background: tokens.bg,
        borderBottom: `1px solid ${tokens.border}`,
      }}
    >
      <span
        style={{
          width: "120px",
          height: "14px",
          borderRadius: "3px",
          background: `linear-gradient(90deg, ${tokens.shimmerBase} 25%, ${tokens.shimmerHighlight} 50%, ${tokens.shimmerBase} 75%)`,
          backgroundSize: "200% 100%",
          animation: "topbar-shimmer 1.5s ease-in-out infinite",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            width: "80px",
            height: "28px",
            borderRadius: "4px",
            background: tokens.shimmerBase,
          }}
        />
        <span
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "4px",
            background: tokens.shimmerBase,
          }}
        />
        <span
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: tokens.shimmerBase,
          }}
        />
      </div>
    </div>
  );
}

// ---- Component ----

export function Topbar({
  appwriteEndpoint = "",
  onSearchOpen,
  onAdd,
  className,
  disabled = false,
  loading = false,
  connectionStatus: connectionOverride,
}: TopbarProps) {
  const { tokens } = useTheme();
  const t = tokens;
  const connStatus = useConnectionStatus(appwriteEndpoint, connectionOverride);

  // ---- Cmd+K / Ctrl+K handler ----
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === "k") {
        e.preventDefault();
        onSearchOpen?.();
      }
    },
    [disabled, onSearchOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ---- Loading state ----
  if (loading) {
    return (
      <>
        <style>{`
          @keyframes topbar-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
        <SkeletonBar tokens={t} />
      </>
    );
  }

  // ---- Connection dot color ----
  const dotColor =
    connStatus === "connected"
      ? "#22c55e"
      : connStatus === "disconnected"
        ? "#ef4444"
        : t.textMuted;

  const dotLabel =
    connStatus === "connected"
      ? "Connected"
      : connStatus === "disconnected"
        ? "Disconnected"
        : "Checking connection...";

  return (
    <header
      role="banner"
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "48px",
        padding: "0 16px",
        background: t.bg,
        borderBottom: `1px solid ${t.border}`,
        fontFamily: "'DM Sans', sans-serif",
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? "none" : "auto",
        transition: "opacity 150ms ease",
        flexShrink: 0,
      }}
    >
      {/* Left: Search trigger */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          type="button"
          onClick={disabled ? undefined : onSearchOpen}
          aria-label="Open search (Cmd+K)"
          title="Search (Cmd+K)"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 10px",
            borderRadius: "4px",
            border: `1px solid ${t.border}`,
            background: t.bgHover,
            color: t.textMuted,
            fontSize: "0.8125rem",
            fontFamily: "'DM Sans', sans-serif",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "background-color 150ms ease, border-color 150ms ease",
            whiteSpace: "nowrap",
            lineHeight: 1.4,
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = t.accent;
              e.currentTarget.style.color = t.text;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = t.border;
            e.currentTarget.style.color = t.textMuted;
          }}
        >
          {/* Search icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search</span>
          <kbd
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "18px",
              height: "18px",
              padding: "0 4px",
              borderRadius: "3px",
              border: `1px solid ${t.border}`,
              background: t.bgActive,
              color: t.textMuted,
              fontSize: "0.6875rem",
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1,
              marginLeft: "2px",
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Add button + Connection status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* Add button */}
        <button
          type="button"
          onClick={disabled ? undefined : onAdd}
          aria-label="Add new item"
          title="Add"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            borderRadius: "4px",
            border: `1px solid ${t.border}`,
            background: t.bgHover,
            color: t.text,
            fontSize: "1.125rem",
            fontFamily: "'DM Sans', sans-serif",
            cursor: disabled ? "not-allowed" : "pointer",
            lineHeight: 1,
            transition: "background-color 150ms ease, border-color 150ms ease, color 150ms ease",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = t.accent;
              e.currentTarget.style.color = t.accent;
              e.currentTarget.style.background = t.bgActive;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = t.border;
            e.currentTarget.style.color = t.text;
            e.currentTarget.style.background = t.bgHover;
          }}
        >
          +
        </button>

        {/* Connection status */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
          aria-label={dotLabel}
          title={dotLabel}
        >
          <span
            aria-hidden="true"
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: dotColor,
              flexShrink: 0,
              transition: "background-color 300ms ease",
              boxShadow:
                connStatus === "connected"
                  ? "0 0 6px rgba(34,197,94,0.5)"
                  : connStatus === "disconnected"
                    ? "0 0 6px rgba(239,68,68,0.4)"
                    : "none",
            }}
          />
          <span
            style={{
              fontSize: "0.6875rem",
              color: t.textMuted,
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: "nowrap",
              lineHeight: 1.4,
            }}
          >
            {connStatus === "connected"
              ? "Connected"
              : connStatus === "disconnected"
                ? "Disconnected"
                : "Checking..."}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
