import React, { useState, useCallback } from "react";
import { useTheme, ThemeTokens } from "./ThemeContext";

// ---- Types ----

export interface RatingBarProps {
  /** Current rating value (0-max) */
  value?: number;
  /** Maximum rating (number of stars); defaults to 5 */
  max?: number;
  /** When true, the rating bar is non-interactive */
  disabled?: boolean;
  /** When true, shows a loading indicator instead of stars */
  loading?: boolean;
  /** Size of each star in pixels; defaults to 20 */
  size?: number;
  /** Called when the user selects a rating */
  onChange?: (value: number) => void;
  /** Accessible label for the rating group */
  ariaLabel?: string;
  /** Additional className wrapper */
  className?: string;
}

// ---- Style Helpers ----

function getStarFillColor(
  tokens: ThemeTokens,
  filled: boolean,
  disabled: boolean
): string {
  if (disabled) return tokens.textDisabled;
  if (filled) return tokens.accent;
  return tokens.separator;
}

function getContainerStyle(tokens: ThemeTokens): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
    padding: "4px 0",
    fontFamily: "'DM Sans', sans-serif",
  };
}

function getInteractiveStyle(disabled: boolean): React.CSSProperties {
  if (disabled) {
    return {
      cursor: "not-allowed",
      pointerEvents: "none",
      opacity: 0.55,
    };
  }
  return { cursor: "pointer" };
}

// ---- Star SVG ----

function StarIcon({
  size,
  filled,
  color,
}: {
  size: number;
  filled: boolean;
  color: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// ---- Skeleton Star ----

function SkeletonStar({
  tokens,
  size,
}: {
  tokens: ThemeTokens;
  size: number;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "2px",
        background: `linear-gradient(90deg, ${tokens.shimmerBase} 25%, ${tokens.shimmerHighlight} 50%, ${tokens.shimmerBase} 75%)`,
        backgroundSize: "200% 100%",
        animation: "ratingbar-shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

// ---- Component ----

export function RatingBar({
  value: controlledValue,
  max = 5,
  disabled = false,
  loading = false,
  size = 20,
  onChange,
  ariaLabel = "Rating",
  className,
}: RatingBarProps) {
  const { tokens } = useTheme();
  const t = tokens;

  const [internalValue, setInternalValue] = useState(0);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;
  const displayValue = hoverValue ?? currentValue;

  const resolvedMax = Math.max(1, Math.floor(max));

  const handleSelect = useCallback(
    (rating: number) => {
      if (disabled) return;
      if (!isControlled) {
        setInternalValue(rating);
      }
      onChange?.(rating);
    },
    [disabled, isControlled, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, rating: number) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSelect(rating);
      }
    },
    [disabled, handleSelect]
  );

  // Loading state
  if (loading) {
    return (
      <span
        role="progressbar"
        aria-label={ariaLabel}
        aria-busy="true"
        className={className}
        style={getContainerStyle(tokens)}
      >
        <style>{`
          @keyframes ratingbar-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
        {Array.from({ length: resolvedMax }, (_, i) => (
          <SkeletonStar key={i} tokens={tokens} size={size} />
        ))}
      </span>
    );
  }

  return (
    <span
      role="group"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={className}
      style={{
        ...getContainerStyle(tokens),
        ...getInteractiveStyle(disabled),
      }}
    >
      {Array.from({ length: resolvedMax }, (_, index) => {
        const starIndex = index + 1;
        const isFilled = starIndex <= displayValue;
        const fillColor = getStarFillColor(tokens, isFilled, disabled);

        return (
          <span
            key={index}
            role="radio"
            aria-checked={starIndex === currentValue}
            aria-label={`${starIndex} star${starIndex > 1 ? "s" : ""}`}
            tabIndex={disabled ? -1 : 0}
            onClick={() => handleSelect(starIndex)}
            onKeyDown={(e) => handleKeyDown(e, starIndex)}
            onMouseEnter={() => {
              if (!disabled) setHoverValue(starIndex);
            }}
            onMouseLeave={() => {
              if (!disabled) setHoverValue(null);
            }}
            onFocus={(e) => {
              if (!disabled) {
                (e.currentTarget as HTMLElement).style.outline = `2px solid ${t.accent}`;
                (e.currentTarget as HTMLElement).style.outlineOffset = "2px";
                (e.currentTarget as HTMLElement).style.borderRadius = "2px";
              }
            }}
            onBlur={(e) => {
              if (!disabled) {
                (e.currentTarget as HTMLElement).style.outline = "none";
              }
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2px",
              borderRadius: "2px",
              transition: "color 150ms ease, transform 150ms ease",
              color: fillColor,
              ...(!disabled
                ? {
                    cursor: "pointer",
                  }
                : {}),
            }}
          >
            <StarIcon size={size} filled={isFilled} color={fillColor} />
          </span>
        );
      })}
    </span>
  );
}

export default RatingBar;
