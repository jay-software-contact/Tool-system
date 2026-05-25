import React from "react";
import { useTheme, ThemeTokens } from "./ThemeContext";

// ---- Types ----

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** When true, the card is non-interactive and visually dimmed */
  disabled?: boolean;
  /** When true, shows skeleton/loading state instead of children */
  loading?: boolean;
  /** Number of skeleton lines in loading state; defaults to 3 */
  loadingLines?: number;
  /** Optional header content rendered above children */
  header?: React.ReactNode;
  /** Optional footer content rendered below children */
  footer?: React.ReactNode;
  /** Additional className wrapper */
  className?: string;
  /** Click handler — card becomes interactive when provided */
  onClick?: () => void;
  /** Accessible label for the card region */
  ariaLabel?: string;
}

// ---- Style Helpers ----

function getCardStyles(
  tokens: ThemeTokens,
  disabled: boolean,
  clickable: boolean
): React.CSSProperties {
  const t = tokens;
  return {
    backgroundColor: t.bg,
    border: `1px solid ${t.border}`,
    borderRadius: "8px",
    padding: "16px",
    fontFamily: "'DM Sans', sans-serif",
    transition: "background-color 150ms ease, border-color 150ms ease, opacity 150ms ease",
    ...(disabled
      ? {
          opacity: 0.5,
          cursor: "not-allowed",
          pointerEvents: "none",
        }
      : clickable
        ? {
            cursor: "pointer",
          }
        : {}),
  };
}

function getHeaderStyles(tokens: ThemeTokens): React.CSSProperties {
  const t = tokens;
  return {
    borderBottom: `1px solid ${t.separator}`,
    paddingBottom: "12px",
    marginBottom: "12px",
    color: t.text,
    fontSize: "1rem",
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
  };
}

function getFooterStyles(tokens: ThemeTokens): React.CSSProperties {
  const t = tokens;
  return {
    borderTop: `1px solid ${t.separator}`,
    paddingTop: "12px",
    marginTop: "12px",
    color: t.textMuted,
    fontSize: "0.8125rem",
  };
}

function getContentStyles(tokens: ThemeTokens, disabled: boolean): React.CSSProperties {
  const t = tokens;
  return {
    color: disabled ? t.textDisabled : t.text,
    fontSize: "0.875rem",
    lineHeight: 1.5,
  };
}

// ---- Skeleton ----

function SkeletonLine({
  tokens,
  width,
}: {
  tokens: ThemeTokens;
  width: string;
}) {
  const t = tokens;
  return (
    <span
      aria-hidden="true"
      style={{
        display: "block",
        width,
        height: "0.75rem",
        borderRadius: "3px",
        background: `linear-gradient(90deg, ${t.shimmerBase} 25%, ${t.shimmerHighlight} 50%, ${t.shimmerBase} 75%)`,
        backgroundSize: "200% 100%",
        animation: "card-shimmer 1.5s ease-in-out infinite",
        marginBottom: "8px",
      }}
    />
  );
}

// ---- Component ----

export function Card({
  children,
  disabled = false,
  loading = false,
  loadingLines = 3,
  header,
  footer,
  className,
  onClick,
  ariaLabel = "Card",
}: CardProps) {
  const { tokens } = useTheme();
  const t = tokens;
  const clickable = !!onClick && !disabled;

  const cardStyle = getCardStyles(tokens, disabled, clickable);

  // Loading state
  if (loading) {
    const lines = Math.max(1, loadingLines);
    return (
      <section
        aria-label={ariaLabel}
        aria-busy="true"
        className={className}
        style={cardStyle}
      >
        <style>{`
          @keyframes card-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
        {header && (
          <div style={getHeaderStyles(tokens)}>
            <SkeletonLine tokens={tokens} width="40%" />
          </div>
        )}
        <div style={getContentStyles(tokens, false)}>
          {Array.from({ length: lines }, (_, i) => (
            <SkeletonLine
              key={i}
              tokens={tokens}
              width={i === lines - 1 ? "60%" : `${70 + i * 10}%`}
            />
          ))}
        </div>
        {footer && (
          <div style={getFooterStyles(tokens)}>
            <SkeletonLine tokens={tokens} width="30%" />
          </div>
        )}
      </section>
    );
  }

  // Interactive card with click
  if (clickable) {
    return (
      <section
        aria-label={ariaLabel}
        className={className}
        style={cardStyle}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = t.bgHover;
          (e.currentTarget as HTMLElement).style.borderColor = t.accent;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = t.bg;
          (e.currentTarget as HTMLElement).style.borderColor = t.border;
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLElement).style.outline = `2px solid ${t.accent}`;
          (e.currentTarget as HTMLElement).style.outlineOffset = "2px";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLElement).style.outline = "none";
        }}
      >
        {header && <div style={getHeaderStyles(tokens)}>{header}</div>}
        <div style={getContentStyles(tokens, disabled)}>{children}</div>
        {footer && <div style={getFooterStyles(tokens)}>{footer}</div>}
      </section>
    );
  }

  // Static card
  return (
    <section
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={className}
      style={cardStyle}
    >
      {header && <div style={getHeaderStyles(tokens)}>{header}</div>}
      <div style={getContentStyles(tokens, disabled)}>{children}</div>
      {footer && <div style={getFooterStyles(tokens)}>{footer}</div>}
    </section>
  );
}

export default Card;
