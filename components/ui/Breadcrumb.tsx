import React from "react";
import { useTheme, ThemeTokens } from "./ThemeContext";

// ---- Types ----

export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Optional href — renders as <a> when provided, <span> otherwise */
  href?: string;
  /** Optional icon element rendered before the label */
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  /** Ordered list of path segments */
  items: BreadcrumbItem[];
  /** Index of the active (current) item; defaults to last item */
  activeIndex?: number;
  /** When true, the entire breadcrumb trail is non-interactive */
  disabled?: boolean;
  /** When true, shows skeleton/loading state instead of items */
  loading?: boolean;
  /** Number of skeleton items in loading state; defaults to 3 */
  loadingCount?: number;
  /** Separator character/node between items; defaults to "/" */
  separator?: React.ReactNode;
  /** Additional className wrapper */
  className?: string;
  /** Called when a non-disabled breadcrumb item is clicked */
  onNavigate?: (item: BreadcrumbItem, index: number) => void;
  /** Accessible label for the nav element */
  ariaLabel?: string;
}

// ---- Style Helpers ----

function getItemStyles(
  tokens: ThemeTokens,
  options: {
    isActive: boolean;
    isDisabled: boolean;
    isClickable: boolean;
  }
): React.CSSProperties {
  const { tokens: t } = { tokens };
  const { isActive, isDisabled, isClickable } = options;

  const base: React.CSSProperties = {
    color: isDisabled
      ? t.textDisabled
      : isActive
        ? t.textActive
        : t.text,
    fontSize: "0.8125rem",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: isActive ? 600 : 400,
    lineHeight: 1.4,
    textDecoration: "none",
    whiteSpace: "nowrap",
    transition: "color 150ms ease, opacity 150ms ease",
    outline: "none",
    borderRadius: "3px",
    padding: "1px 3px",
    margin: "-1px -3px",
  };

  if (isClickable && !isDisabled) {
    base.cursor = "pointer";
  }

  if (isDisabled) {
    base.cursor = "not-allowed";
    base.pointerEvents = "none";
  }

  return base;
}

function getInteractiveStyles(
  tokens: ThemeTokens,
  isDisabled: boolean
): React.CSSProperties {
  if (isDisabled) {
    return {
      cursor: "not-allowed",
      pointerEvents: "none",
      opacity: 0.55,
    };
  }
  return { cursor: "pointer" };
}

// ---- Skeleton Item ----

function SkeletonItem({
  tokens,
  width,
}: {
  tokens: ThemeTokens;
  width: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width,
        height: "0.75rem",
        borderRadius: "2px",
        background: `linear-gradient(90deg, ${tokens.shimmerBase} 25%, ${tokens.shimmerHighlight} 50%, ${tokens.shimmerBase} 75%)`,
        backgroundSize: "200% 100%",
        animation: "breadcrumb-shimmer 1.5s ease-in-out infinite",
        verticalAlign: "middle",
        margin: "0 2px",
      }}
    />
  );
}

// ---- Component ----

export function Breadcrumb({
  items,
  activeIndex,
  disabled = false,
  loading = false,
  loadingCount = 3,
  separator = "/",
  className,
  onNavigate,
  ariaLabel = "Breadcrumb",
}: BreadcrumbProps) {
  const { tokens } = useTheme();
  const t = tokens;

  // Loading state renders animated skeletons
  if (loading) {
    const count = Math.max(1, loadingCount);
    return (
      <nav
        aria-label={ariaLabel}
        aria-busy="true"
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 0",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <style>{`
          @keyframes breadcrumb-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
        {Array.from({ length: count }, (_, i) => (
          <React.Fragment key={i}>
            <SkeletonItem
              tokens={tokens}
              width={i === count - 1 ? "40px" : `${50 + Math.random() * 50}px`}
            />
            {i < count - 1 && (
              <span
                aria-hidden="true"
                style={{
                  color: t.separator,
                  opacity: 0.4,
                  fontSize: "0.75rem",
                  margin: "0 2px",
                  userSelect: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {separator}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }

  const resolvedActiveIndex =
    activeIndex ?? Math.max(0, items.length - 1);

  const handleClick = (item: BreadcrumbItem, index: number) => {
    if (!disabled && item.href) {
      onNavigate?.(item, index);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    item: BreadcrumbItem,
    index: number
  ) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled && item.href) {
      e.preventDefault();
      onNavigate?.(item, index);
    }
  };

  return (
    <nav
      aria-label={ariaLabel}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 0",
        ...getInteractiveStyles(tokens, disabled),
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isActive = index === resolvedActiveIndex;
        const hasHref = !!item.href;
        const isClickable = hasHref && !disabled && !isActive;
        const iconSize = "0.875em";

        const itemStyle = getItemStyles(tokens, {
          isActive,
          isDisabled: disabled,
          isClickable,
        });

        // Wrapper with hover/disabled highlight
        const wrapperProps: React.HTMLAttributes<HTMLElement> & {
          onKeyDown?: React.KeyboardEvent<HTMLElement>;
        } = {
          style: itemStyle,
          onClick: () => handleClick(item, index),
          onKeyDown: (e: React.KeyboardEvent<HTMLElement>) =>
            handleKeyDown(e as unknown as React.KeyboardEvent, item, index),
          ...(isClickable
            ? {
                role: "link" as const,
                tabIndex: 0,
              }
            : {}),
          ...(isActive ? { "aria-current": "page" as const } : {}),
          ...(disabled && !hasHref
            ? { "aria-disabled": true as const }
            : {}),
        };

        const content = (
          <>
            {item.icon && (
              <span
                aria-hidden="true"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginRight: "4px",
                  width: iconSize,
                  height: iconSize,
                  verticalAlign: "text-bottom",
                  opacity: disabled ? 0.4 : isActive ? 1 : 0.7,
                }}
              >
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
          </>
        );

        return (
          <React.Fragment key={index}>
            {/* Item */}
            {hasHref && !disabled ? (
              <a
                href={item.href}
                {...wrapperProps}
                style={{
                  ...itemStyle,
                  textDecoration: "none",
                  ...(isClickable
                    ? {
                        ":hover": undefined, // handled via CSS-in-JS below
                      }
                    : {}),
                }}
                onMouseEnter={(e) => {
                  if (isClickable) {
                    (e.target as HTMLElement).style.color = t.accentHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (isClickable) {
                    (e.target as HTMLElement).style.color = isActive
                      ? t.textActive
                      : t.text;
                  }
                }}
                onFocus={(e) => {
                  (e.target as HTMLElement).style.outline = `2px solid ${t.accent}`;
                  (e.target as HTMLElement).style.outlineOffset = "2px";
                }}
                onBlur={(e) => {
                  (e.target as HTMLElement).style.outline = "none";
                }}
              >
                {content}
              </a>
            ) : (
              <span {...wrapperProps}>{content}</span>
            )}

            {/* Separator */}
            {!isLast && (
              <span
                aria-hidden="true"
                style={{
                  color: t.separator,
                  opacity: disabled ? 0.3 : 0.5,
                  fontSize: "0.75rem",
                  margin: "0 2px",
                  userSelect: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                {separator}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
