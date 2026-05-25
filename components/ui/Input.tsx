import React, {
  useState,
  useCallback,
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { useTheme } from "./ThemeContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Visual variant — default | disabled | loading */
  variant?: "default" | "disabled" | "loading";
  /** Optional label rendered above the input */
  label?: string;
  /** Optional helper / error text rendered below the input */
  helperText?: string;
  /** When true, helperText renders in an error-tinted color */
  error?: boolean;
  /** Size scale */
  size?: "sm" | "md" | "lg";
  /** Optional icon rendered inside the input on the left */
  leftIcon?: ReactNode;
  /** Optional icon rendered inside the input on the right */
  rightIcon?: ReactNode;
  /** When true, renders a <textarea> instead of <input> */
  multiline?: boolean;
  /** Number of visible rows when multiline is true */
  rows?: number;
  /** Additional className for the wrapper */
  className?: string;
  /** Additional inline styles for the wrapper */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Spinner (loading indicator)
// ---------------------------------------------------------------------------

function Spinner({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0, animation: "oc-input-spin 800ms linear infinite" }}
    >
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="2" opacity="0.2" />
      <path d="M8 2 A6 6 0 0 1 14 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(function Input(props, ref) {
  const {
    variant = "default",
    label,
    helperText,
    error = false,
    size = "md",
    leftIcon,
    rightIcon,
    multiline = false,
    rows = 3,
    disabled,
    className,
    style,
    id: externalId,
    onFocus,
    onBlur,
    ...rest
  } = props;

  const { tokens: t } = useTheme();
  const generatedId = useId();
  const id = externalId ?? generatedId;

  const isDisabled = disabled || variant === "disabled";
  const isLoading = variant === "loading";

  // -----------------------------------------------------------------------
  // Size scale (px values — structural, not theme tokens)
  // -----------------------------------------------------------------------

  const sizes = {
    sm: { height: 32, fontSize: 12, padH: 8, icon: 14 },
    md: { height: 40, fontSize: 14, padH: 12, icon: 16 },
    lg: { height: 48, fontSize: 16, padH: 16, icon: 18 },
  } as const;

  const sz = sizes[size] ?? sizes.md;

  // -----------------------------------------------------------------------
  // Color resolution from flat theme tokens
  // -----------------------------------------------------------------------

  const bg = isDisabled ? t.bgHover : t.bg;
  const borderDefault = isDisabled ? t.textDisabled : t.border;
  const borderFocus = t.accent;
  const textColor = isDisabled ? t.textDisabled : t.text;
  const placeholderColor = t.textMuted;
  const labelColor = isDisabled ? t.textDisabled : t.textMuted;
  const helperColor = error ? "#ef4444" : t.textMuted;
  const iconColor = isDisabled ? t.textDisabled : t.textMuted;
  const spinnerColor = t.accent;

  // -----------------------------------------------------------------------
  // Focus state
  // -----------------------------------------------------------------------

  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFocused(true);
      onFocus?.(e as any);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFocused(false);
      onBlur?.(e as any);
    },
    [onBlur],
  );

  // -----------------------------------------------------------------------
  // Inject keyframes once
  // -----------------------------------------------------------------------

  React.useEffect(() => {
    if (!document.getElementById("oc-input-style")) {
      const s = document.createElement("style");
      s.id = "oc-input-style";
      s.textContent =
        "@keyframes oc-input-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }";
      document.head.appendChild(s);
    }
  }, []);

  // -----------------------------------------------------------------------
  // Input / textarea style
  // -----------------------------------------------------------------------

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: multiline ? undefined : sz.height,
    minHeight: multiline ? sz.height * 1.5 : undefined,
    paddingTop: multiline ? sz.padH * 0.75 : 0,
    paddingBottom: multiline ? sz.padH * 0.75 : 0,
    paddingLeft: leftIcon ? sz.height + sz.padH - 4 : sz.padH,
    paddingRight: rightIcon || isLoading ? sz.height + sz.padH - 4 : sz.padH,
    fontSize: sz.fontSize,
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.5,
    color: textColor,
    backgroundColor: bg,
    border: `1px solid ${focused ? borderFocus : borderDefault}`,
    borderRadius: "6px",
    outline: "none",
    boxShadow: focused ? `0 0 0 2px ${t.accent}33` : "none",
    transition: "border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease",
    cursor: isDisabled ? "not-allowed" : "text",
    opacity: isDisabled ? 0.55 : 1,
    pointerEvents: isDisabled ? "none" : "auto",
    boxSizing: "border-box",
    resize: "vertical" as const,
    ...style,
  };

  // Placeholder color via inline <style> scoped to this instance
  const placeholderCss = `#${id}::placeholder { color: ${placeholderColor}; opacity: 1; }`;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        width: "100%",
      }}
    >
      {/* Scoped placeholder color */}
      <style>{placeholderCss}</style>

      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: sz.fontSize * 0.875,
            fontWeight: 500,
            fontFamily: "'Space Grotesk', sans-serif",
            color: labelColor,
            cursor: isDisabled ? "not-allowed" : "default",
            userSelect: "none",
          }}
        >
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
        {/* Left icon */}
        {leftIcon && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: sz.padH,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              color: iconColor,
              pointerEvents: "none",
            }}
          >
            {leftIcon}
          </span>
        )}

        {/* Input element */}
        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={id}
            rows={rows}
            disabled={isDisabled}
            aria-disabled={isDisabled || undefined}
            aria-invalid={error || undefined}
            aria-describedby={helperText ? `${id}-helper` : undefined}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={id}
            disabled={isDisabled}
            aria-disabled={isDisabled || undefined}
            aria-invalid={error || undefined}
            aria-describedby={helperText ? `${id}-helper` : undefined}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {/* Right icon (hidden when loading) */}
        {rightIcon && !isLoading && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              right: sz.padH,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              color: iconColor,
              pointerEvents: "none",
            }}
          >
            {rightIcon}
          </span>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              right: sz.padH,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Spinner size={sz.icon} color={spinnerColor} />
          </span>
        )}
      </div>

      {/* Helper / error text */}
      {helperText && (
        <span
          id={`${id}-helper`}
          role={error ? "alert" : undefined}
          style={{
            fontSize: sz.fontSize * 0.8125,
            lineHeight: 1.4,
            color: helperColor,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
export default Input;
