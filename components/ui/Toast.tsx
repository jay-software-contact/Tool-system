import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useTheme } from "./ThemeContext";

// ---------------------------------------------------------------------------
// Toast types
// ---------------------------------------------------------------------------

export type ToastVariant = "info" | "success" | "warning" | "error";

export interface ToastProps {
  /** Unique id — used for dismiss keying */
  id?: string;
  /** Visual variant */
  variant?: ToastVariant;
  /** Title text (bold) */
  title?: string;
  /** Body message */
  message: string;
  /** Auto-dismiss delay in ms. Default 3000. 0 = no auto-dismiss. */
  duration?: number;
  /** Disabled state — grays out, pauses auto-dismiss */
  disabled?: boolean;
  /** Loading state — shows shimmer block, pauses auto-dismiss */
  loading?: boolean;
  /** Callback fired on dismiss */
  onDismiss?: (id: string) => void;
  /** Manual dismiss button */
  dismissible?: boolean;
}

// ---------------------------------------------------------------------------
// Variant accent color — uses theme accent, supplemented with fixed severity
// ---------------------------------------------------------------------------

function variantAccent(variant: ToastVariant, accent: string): string {
  switch (variant) {
    case "success":
      return "#4ade80";
    case "error":
      return "#f87171";
    case "warning":
      return accent; // amber from theme
    case "info":
    default:
      return "#60a5fa";
  }
}

// ---------------------------------------------------------------------------
// Single Toast
// ---------------------------------------------------------------------------

export const Toast: React.FC<ToastProps> = ({
  id = crypto.randomUUID(),
  variant = "info",
  title,
  message,
  duration = 3000,
  disabled = false,
  loading = false,
  onDismiss,
  dismissible = true,
}) => {
  const { tokens: t } = useTheme();
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(duration);
  const startedRef = useRef<number | null>(null);

  const accentColor = variantAccent(variant, t.accent);

  // ---- timer helpers ----

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (startedRef.current !== null) {
      const elapsed = Date.now() - startedRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
      startedRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (duration <= 0 || disabled || loading) return;
    startedRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      triggerDismiss();
    }, remainingRef.current);
  }, [duration, disabled, loading]);

  const triggerDismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss?.(id), 200);
  }, [id, onDismiss]);

  // mount: start timer
  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // react to disabled / loading changes
  useEffect(() => {
    if (disabled || loading) {
      clearTimer();
    } else {
      startTimer();
    }
  }, [disabled, loading, clearTimer, startTimer]);

  // pause on hover
  const handleMouseEnter = () => {
    if (!disabled && !loading) clearTimer();
  };
  const handleMouseLeave = () => {
    if (!disabled && !loading) startTimer();
  };

  // ---- styles ----

  const containerStyle: React.CSSProperties = {
    position: "relative",
    minWidth: 320,
    maxWidth: 420,
    background: t.bgActive,
    border: `1px solid ${t.border}`,
    borderRadius: "8px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    padding: "14px 16px",
    fontFamily: "'DM Sans', sans-serif",
    color: disabled ? t.textDisabled : t.text,
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? "none" : "auto",
    transition: "opacity 0.2s ease, transform 0.2s ease",
    transform: exiting ? "translateX(40px)" : "translateX(0)",
    overflow: "hidden",
  };

  const accentBarStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    background: disabled ? t.textDisabled : accentColor,
  };

  const iconStyle: React.CSSProperties = {
    flexShrink: 0,
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: disabled ? t.bg : accentColor + "22",
    color: disabled ? t.textDisabled : accentColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
  };

  const contentStyle: React.CSSProperties = { flex: 1, minWidth: 0 };

  const titleStyle: React.CSSProperties = {
    fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    color: disabled ? t.textDisabled : t.text,
    marginBottom: title ? 2 : 0,
    lineHeight: 1.3,
  };

  const messageStyle: React.CSSProperties = {
    fontSize: 13,
    lineHeight: 1.45,
    color: disabled ? t.textDisabled : t.textMuted,
    wordBreak: "break-word",
  };

  const dismissBtnStyle: React.CSSProperties = {
    flexShrink: 0,
    background: "none",
    border: "none",
    color: t.textMuted,
    cursor: disabled ? "not-allowed" : "pointer",
    padding: 2,
    fontSize: 16,
    lineHeight: 1,
    opacity: 0.7,
  };

  const loadingStyle: React.CSSProperties = {
    width: 22,
    height: 22,
    borderRadius: "50%",
    flexShrink: 0,
    background: `linear-gradient(90deg, ${t.shimmerBase} 25%, ${t.shimmerHighlight} 50%, ${t.shimmerBase} 75%)`,
    backgroundSize: "200% 100%",
    animation: "toast-loading 1s ease-in-out infinite",
    opacity: disabled ? 0.3 : 0.8,
  };

  const variantLabel: Record<ToastVariant, string> = {
    info: "i",
    success: "\u2713",
    warning: "!",
    error: "\u2715",
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      aria-disabled={disabled || undefined}
    >
      <style>{`
        @keyframes toast-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={containerStyle}>
        <div style={accentBarStyle} />

        {loading ? (
          <div style={loadingStyle} />
        ) : (
          <div style={iconStyle}>{variantLabel[variant]}</div>
        )}

        <div style={contentStyle}>
          {title && <div style={titleStyle}>{title}</div>}
          <div style={messageStyle}>{message}</div>
        </div>

        {dismissible && (
          <button
            style={dismissBtnStyle}
            onClick={triggerDismiss}
            disabled={disabled}
            aria-label="Dismiss toast"
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.7";
            }}
          >
            {"\u00D7"}
          </button>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// ToastContainer — manages a stack of toasts
// ---------------------------------------------------------------------------

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
  disabled?: boolean;
  loading?: boolean;
}

export interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  position = "top-right",
}) => {
  const { tokens: t } = useTheme();

  const wrapperStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
    ...(position.includes("top") ? { top: 24 } : { bottom: 24 }),
    ...(position.includes("right") ? { right: 24 } : {}),
    ...(position.includes("left") ? { left: 24 } : {}),
    ...(position.includes("center")
      ? { left: "50%", transform: "translateX(-50%)" }
      : {}),
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div style={wrapperStyle}>
      {toasts.map((toast, i) => (
        <div key={toast.id} style={{ marginTop: i > 0 ? 8 : 0 }}>
          <Toast
            id={toast.id}
            variant={toast.variant}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            disabled={toast.disabled}
            loading={toast.loading}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// useToast hook — imperative toast API
// ---------------------------------------------------------------------------

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((opts: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...opts, id }]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  return { toasts, toast: addToast, dismiss, clear };
}

export default Toast;
