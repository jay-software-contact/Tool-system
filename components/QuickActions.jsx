import React, { useCallback, useState } from "react";
import { useTheme } from "./ThemeContext";

// ---- Types ----

/**
 * A single quick action button descriptor.
 */
export interface QuickAction {
  /** Unique identifier for the action */
  id: string;
  /** Button label text */
  label: string;
  /** Optional SVG icon element rendered before the label */
  icon?: React.ReactNode;
  /** Semantic variant controlling color emphasis */
  variant?: "primary" | "secondary" | "danger";
  /** When true, renders a muted/disabled button */
  disabled?: boolean;
  /** Accessible tooltip / title attribute */
  title?: string;
}

export interface QuickActionSection {
  /** Section heading (e.g. "Frequent", "Create") */
  heading: string;
  /** Actions within this section */
  actions: QuickAction[];
}

export interface QuickActionsProps {
  /** Flat array of actions or grouped sections (defaults to flat default set) */
  sections?: QuickActionSection[];
  /** Flat actions array — used when sections is not provided */
  actions?: QuickAction[];
  /** Called when an enabled action button fires */
  onAction?: (action: QuickAction) => void;
  /** When true, renders skeleton placeholders */
  loading?: boolean;
  /** Number of skeleton buttons in loading state */
  loadingCount?: number;
  /** Additional className for the wrapper */
  className?: string;
}

// ---- Default Actions ----

export const DEFAULT_QUICK_ACTIONS = [
  {
    id: "new-issue",
    label: "New Issue",
    variant: "primary",
    title: "Create a new tracking issue",
  },
  {
    id: "view-issues",
    label: "View All Issues",
    variant: "secondary",
    title: "Browse all tracked issues",
  },
  {
    id: "generate-report",
    label: "Generate Report",
    variant: "secondary",
    title: "Run a new analytics report",
  },
];

// ---- Style Helpers ----

function getButtonBase(tokens, disabled) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    fontSize: "0.8125rem",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    lineHeight: 1,
    border: `1px solid transparent`,
    borderRadius: "6px",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 150ms ease",
    whiteSpace: "nowrap",
    outline: "none",
    textDecoration: "none",
    height: "36px",
    opacity: disabled ? 0.5 : 1,
    boxSizing: "border-box",
  };
}

function applyVariant(base, tokens, variant) {
  const s = { ...base };
  if (variant === "primary") {
    s.backgroundColor = tokens.accent;
    s.color = tokens.bg;
    s.borderColor = tokens.accent;
  } else if (variant === "danger") {
    s.backgroundColor = "transparent";
    s.color = "#f87171";
    s.borderColor = "#f87171";
  } else {
    // secondary
    s.backgroundColor = "transparent";
    s.color = tokens.text;
    s.borderColor = tokens.border;
  }
  return s;
}

function getHoverStyle(tokens, variant) {
  if (variant === "primary") {
    return {
      backgroundColor: tokens.accentHover,
      borderColor: tokens.accentHover,
    };
  }
  if (variant === "danger") {
    return {
      backgroundColor: "rgba(248, 113, 113, 0.12)",
      borderColor: "#f87171",
    };
  }
  return {
    backgroundColor: tokens.bgHover,
    borderColor: tokens.accent,
  };
}

function getFocusStyle(tokens) {
  return {
    boxShadow: `0 0 0 2px ${tokens.accent}`,
    outline: "none",
  };
}

// ---- Skeleton ----

function SkeletonButton({ width, tokens }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width,
        height: "36px",
        borderRadius: "6px",
        background: `linear-gradient(90deg, ${tokens.shimmerBase} 25%, ${tokens.shimmerHighlight} 50%, ${tokens.shimmerBase} 75%)`,
        backgroundSize: "200% 100%",
        animation: "qa-shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

// ---- Action Button ----

function ActionButton({ action, tokens, onAction }) {
  const variant = action.variant || "secondary";
  const disabled = action.disabled || false;

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  let style = applyVariant(getButtonBase(tokens, disabled), tokens, variant);
  if (hovered && !disabled) {
    style = { ...style, ...getHoverStyle(tokens, variant) };
  }
  if (focused && !disabled) {
    style = { ...style, ...getFocusStyle(tokens) };
  }
  if (pressed && !disabled) {
    style = { ...style, transform: "scale(0.97)" };
  }

  const handleClick = () => {
    if (!disabled) {
      onAction?.(action);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      onAction?.(action);
    }
  };

  return (
    <button
      type="button"
      title={action.title}
      disabled={disabled}
      style={style}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {action.icon && (
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            width: "1em",
            height: "1em",
            flexShrink: 0,
          }}
        >
          {action.icon}
        </span>
      )}
      {action.label}
    </button>
  );
}

// ---- Component ----

export function QuickActions({
  sections,
  actions,
  onAction,
  loading = false,
  loadingCount = 3,
  className,
}) {
  const { tokens } = useTheme();

  // Resolve actions — fall back to defaults
  const resolvedSections = sections ||
    (actions ? [{ heading: "Actions", actions }] : null);

  return (
    <section
      aria-label="Quick Actions"
      className={`qa-section ${className ?? ""}`}
    >
      <style>{`
        @keyframes qa-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <h2
        style={{
          fontSize: "0.9375rem",
          fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
          fontWeight: 600,
          color: tokens.text,
          marginBottom: "16px",
          letterSpacing: "0.01em",
        }}
      >
        Quick Actions
      </h2>

      {loading ? (
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
          aria-busy="true"
        >
          {Array.from({ length: loadingCount }, (_, i) => (
            <SkeletonButton
              key={i}
              tokens={tokens}
              width={`${90 + (i % 3) * 25}px`}
            />
          ))}
        </div>
      ) : resolvedSections ? (
        // Grouped sections mode
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {resolvedSections.map((section) => (
            <div key={section.heading}>
              <h3
                style={{
                  fontSize: "0.6875rem",
                  fontFamily: "'DM Sans', sans-serif",
                  color: tokens.textMuted,
                  fontWeight: 600,
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {section.heading}
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {section.actions.map((action) => (
                  <ActionButton
                    key={action.id}
                    action={action}
                    tokens={tokens}
                    onAction={onAction}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Default flat actions
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {DEFAULT_QUICK_ACTIONS.map((action) => (
            <ActionButton
              key={action.id}
              action={action}
              tokens={tokens}
              onAction={onAction}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default QuickActions;
