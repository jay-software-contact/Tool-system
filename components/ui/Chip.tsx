import React from "react";
import { useTheme, ThemeTokens } from "./ThemeContext";

// ---- Types ----

export type ChipVariant = "solid" | "outline" | "ghost";
export type ChipSize = "sm" | "md" | "lg";

export interface ChipProps {
  /** Chip label text */
  label: string;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
  /** Optional close/delete callback renders a trailing X button */
  onClose?: () => void;
  /** When true, the chip is non-interactive and visually muted */
  disabled?: boolean;
  /** When true, shows skeleton/loading state instead of label */
  loading?: boolean;
  /** Visual variant; defaults to "solid" */
  variant?: ChipVariant;
  /** Size variant; defaults to "md" */
  size?: ChipSize;
  /** Additional className wrapper */
  className?: string;
  /** Click handler — when provided the chip renders as a button */
  onClick?: () => void;
  /** Accessible label; defaults to label */
  ariaLabel?: string;
}

// ---- Style Helpers ----

function getChipStyles(
  tokens: ThemeTokens,
  options: {
    variant: ChipVariant;
    size: ChipSize;
    disabled: boolean;
    clickable: boolean;
    loading: boolean;
  }
): React.CSSProperties {
  const { variant, size, disabled, clickable } = options;

  const sizeMap: Record<ChipSize, React.CSSProperties> = {
    sm: { fontSize: "0.6875rem", padding: "2px 8px", borderRadius: "10px", gap: "3px", lineHeight: 1.3 },
    md: { fontSize: "0.75rem", padding: "3px 10px", borderRadius: "12px", gap: "4px", lineHeight: 1.4 },
    lg: { fontSize: "0.8125rem", padding: "5px 14px", borderRadius: "14px", gap: "6px", lineHeight: 1.4 },
  };

  const variantStyles: Record<ChipVariant, React.CSSProperties> = {
    solid: {
      backgroundColor: disabled ? tokens.shimmerBase : tokens.accent,
      color: disabled ? tokens.textDisabled : "#0a0a0a",
      border: `1px solid ${disabled ? tokens.border : tokens.accent}`,
    },
    outline: {
      backgroundColor: "transparent",
      color: disabled ? tokens.textDisabled : tokens.text,
      border: `1px solid ${disabled ? tokens.border : tokens.accent}`,
    },
    ghost: {
      backgroundColor: disabled ? "transparent" : tokens.bgHover,
      color: disabled ? tokens.textDisabled : tokens.text,
      border: `1px solid ${disabled ? tokens.border : tokens.separator}`,
    },
  };

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    whiteSpace: "nowrap",
    transition: "background-color 150ms ease, color 150ms ease, border-color 150ms ease, opacity 150ms ease",
    outline: "none",
    userSelect: "none",
    ...sizeMap[size],
    ...variantStyles[variant],
  };

  if (disabled) {
    base.cursor = "not-allowed";
    base.opacity = 0.5;
  } else if (clickable) {
    base.cursor = "pointer";
  }

  return base;
}

// ---- Skeleton ----

function ChipSkeleton({
  tokens,
  variant,
  size,
}: {
  tokens: ThemeTokens;
  variant: ChipVariant;
  size: ChipSize;
}) {
  const widthMap: Record<ChipSize, string> = { sm: "48px", md: "64px", lg: "80px" };
  const bgColor =
    variant === "solid" ? tokens.shimmerBase : "transparent";
  const borderColor =
    variant === "solid"
      ? tokens.shimmerBase
      : variant === "outline"
        ? tokens.border
        : tokens.separator;

  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: widthMap[size],
        height: size === "sm" ? "18px" : size === "md" ? "22px" : "26px",
        borderRadius: size === "sm" ? "10px" : size === "md" ? "12px" : "14px",
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        backgroundImage: `linear-gradient(90deg, ${tokens.shimmerBase} 25%, ${tokens.shimmerHighlight} 50%, ${tokens.shimmerBase} 75%)`,
        backgroundSize: "200% 100%",
        animation: "chip-shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

// ---- Close Icon ----

function CloseIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M3 3L9 9M9 3L3 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---- Component ----

export function Chip({
  label,
  icon,
  onClose,
  disabled = false,
  loading = false,
  variant = "solid",
  size = "md",
  className,
  onClick,
  ariaLabel,
}: ChipProps) {
  const { tokens } = useTheme();
  const clickable = !!onClick && !disabled;

  // Loading skeleton
  if (loading) {
    return (
      <>
        <style>{`
          @keyframes chip-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
        <ChipSkeleton tokens={tokens} variant={variant} size={size} />
      </>
    );
  }

  const chipStyle = getChipStyles(tokens, {
    variant,
    size,
    disabled,
    clickable,
    loading,
  });

  const iconFontSize = size === "sm" ? "0.75em" : size === "md" ? "0.875em" : "1em";
  const closeSize = size === "sm" ? 10 : size === "md" ? 12 : 14;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) onClose?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  const handleCloseKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClose?.();
    }
  };

  const focusStyles: React.CSSProperties = clickable
    ? {}
    : { outline: "none" };

  const inlineHover =
    clickable
      ? {
          onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
            if (variant === "solid") {
              (e.currentTarget as HTMLElement).style.backgroundColor = tokens.accentHover;
              (e.currentTarget as HTMLElement).style.borderColor = tokens.accentHover;
            } else if (variant === "outline") {
              (e.currentTarget as HTMLElement).style.backgroundColor = tokens.bgHover;
            } else {
              (e.currentTarget as HTMLElement).style.backgroundColor = tokens.bgActive;
            }
          },
          onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
            if (variant === "solid") {
              (e.currentTarget as HTMLElement).style.backgroundColor = tokens.accent;
              (e.currentTarget as HTMLElement).style.borderColor = tokens.accent;
            } else if (variant === "outline") {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            } else {
              (e.currentTarget as HTMLElement).style.backgroundColor = tokens.bgHover;
            }
          },
          onFocus: (e: React.FocusEvent<HTMLElement>) => {
            (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 2px ${tokens.accent}`;
            (e.currentTarget as HTMLElement).style.boxShadowOffset = "2px";
          },
          onBlur: (e: React.FocusEvent<HTMLElement>) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          },
        }
      : {};

  const renderContent = () => (
    <>
      {icon && (
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: iconFontSize,
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      )}
      <span>{label}</span>
      {onClose && !disabled && (
        <button
          type="button"
          tabIndex={0}
          aria-label={`Remove ${label}`}
          onClick={handleClose}
          onKeyDown={handleCloseKeyDown}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1px",
            marginLeft: "2px",
            marginRight: "-2px",
            border: "none",
            background: "transparent",
            color: "inherit",
            cursor: disabled ? "not-allowed" : "pointer",
            borderRadius: "50%",
            flexShrink: 0,
            opacity: 0.7,
            outline: "none",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "1";
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,0,0,0.12)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "0.7";
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 2px ${tokens.accent}`;
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          <CloseIcon size={closeSize} />
        </button>
      )}
    </>
  );

  if (clickable) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel ?? label}
        aria-disabled={disabled}
        className={className}
        style={{ ...chipStyle, ...focusStyles, fontFamily: "'DM Sans', sans-serif" }}
        {...inlineHover}
      >
        {renderContent()}
      </button>
    );
  }

  return (
    <span
      aria-label={ariaLabel ?? label}
      aria-disabled={disabled ? true : undefined}
      className={className}
      style={{ ...chipStyle, ...focusStyles }}
    >
      {renderContent()}
    </span>
  );
}

export default Chip;
