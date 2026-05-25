import React from "react";
import { useTheme } from "./ui/ThemeContext";

// ---- Types ----

export type StepStatus = "pending" | "active" | "completed";

export interface StepDefinition {
  id: string;
  label: string;
  description?: string;
}

export interface ProgressTrackerProps {
  /** 1-based index of the currently active step (1-4). Ignored if `steps` prop provided. */
  currentStep?: number;
  /** Step definitions. Defaults to [Input, Processing, Extraction, Complete]. */
  steps?: StepDefinition[];
  /** Override status per step keyed by step id. */
  stepStatuses?: Record<string, StepStatus>;
  /** Additional className for the wrapper. */
  className?: string;
  /** Compact mode for tight spaces. */
  compact?: boolean;
  /** Click handler for step labels (optional). */
  onStepClick?: (stepId: string, index: number) => void;
}

const DEFAULT_STEPS: StepDefinition[] = [
  { id: "input", label: "Input", description: "Submit document" },
  { id: "processing", label: "Processing", description: "Parse & prepare" },
  { id: "extraction", label: "Extraction", description: "Extract fields" },
  { id: "complete", label: "Complete", description: "Results ready" },
];

// ---- Helpers ----

function getStepStatus(
  index: number,
  currentStep: number,
  overrides?: Record<string, StepStatus>,
  steps?: StepDefinition[]
): StepStatus {
  const id = steps?.[index]?.id ?? String(index);
  if (overrides?.[id]) return overrides[id];
  if (index < currentStep) return "completed";
  if (index === currentStep) return "active";
  return "pending";
}

function clampStep(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// ---- Step Icon ----

function StepIcon({
  status,
  index,
  tokens,
}: {
  status: StepStatus;
  index: number;
  tokens: ReturnType<typeof useTheme>["tokens"];
}) {
  // completed: green checkmark
  if (status === "completed") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#4ade80"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }

  // active: step number on accent circle
  if (status === "active") {
    return (
      <span
        style={{
          fontSize: "0.625rem",
          fontWeight: 700,
          fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
          color: tokens.bg,
        }}
      >
        {index + 1}
      </span>
    );
  }

  // pending: step number muted
  return (
    <span
      style={{
        fontSize: "0.625rem",
        fontWeight: 600,
        fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
        color: tokens.textDisabled,
      }}
    >
      {index + 1}
    </span>
  );
}

// ---- Main Component ----

export function ProgressTracker({
  currentStep: rawCurrent = 1,
  steps = DEFAULT_STEPS,
  stepStatuses,
  className,
  compact = false,
  onStepClick,
}: ProgressTrackerProps) {
  const { tokens } = useTheme();
  const t = tokens;
  const count = steps.length;
  const currentStep = clampStep(rawCurrent, 0, count - 1);

  // Progress bar fill percentage: 0% at step 0, 100% at last step
  const progressPct = count > 1 ? (currentStep / (count - 1)) * 100 : 0;

  return (
    <div
      className={className}
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={count}
      aria-label={`Step ${currentStep + 1} of ${count}: ${steps[currentStep]?.label}`}
      style={{
        width: "100%",
        fontFamily: "'DM Sans', sans-serif",
        padding: compact ? "12px 16px" : "16px 24px",
        backgroundColor: t.bgActive,
        borderRadius: "8px",
        border: `1px solid ${t.border}`,
      }}
    >
      {/* Steps row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {/* Background connector line */}
        <div
          style={{
            position: "absolute",
            top: compact ? "14px" : "16px",
            left: "0",
            right: "0",
            height: "2px",
            backgroundColor: t.border,
            zIndex: 0,
          }}
        />

        {/* Filled connector line */}
        <div
          style={{
            position: "absolute",
            top: compact ? "14px" : "16px",
            left: "0",
            width: `${progressPct}%`,
            height: "2px",
            backgroundColor:
              currentStep >= count - 1 ? "#4ade80" : t.accent,
            transition: "width 350ms ease, background-color 350ms ease",
            zIndex: 1,
          }}
        />

        {/* Step circles + labels */}
        {steps.map((step, i) => {
          const status = getStepStatus(i, currentStep, stepStatuses, steps);
          const isClickable = !!onStepClick && (status === "completed");

          // circle bg color
          let circleBg: string;
          let circleBorder: string;
          if (status === "completed") {
            circleBg = "#4ade80";
            circleBorder = "#4ade80";
          } else if (status === "active") {
            circleBg = t.accent;
            circleBorder = t.accent;
          } else {
            circleBg = t.bg;
            circleBorder = t.border;
          }

          // label color
          let labelColor: string;
          if (status === "completed") labelColor = "#4ade80";
          else if (status === "active") labelColor = t.text;
          else labelColor = t.textMuted;

          return (
            <div
              key={step.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                position: "relative",
                zIndex: 2,
                gap: compact ? "4px" : "6px",
              }}
            >
              {/* Circle */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.id, i)}
                aria-label={`${step.label}: ${
                  status === "completed"
                    ? "Completed"
                    : status === "active"
                    ? "In progress"
                    : "Pending"
                }`}
                style={{
                  width: compact ? "28px" : "32px",
                  height: compact ? "28px" : "32px",
                  borderRadius: "50%",
                  border: `2px solid ${circleBorder}`,
                  backgroundColor: circleBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isClickable ? "pointer" : "default",
                  padding: 0,
                  transition:
                    "background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
                  boxShadow:
                    status === "active"
                      ? `0 0 0 3px ${t.accent}33`
                      : "none",
                  flexShrink: 0,
                }}
              >
                <StepIcon status={status} index={i} tokens={t} />
              </button>

              {/* Label */}
              <span
                style={{
                  fontSize: compact ? "0.625rem" : "0.75rem",
                  fontWeight: status === "active" ? 600 : 500,
                  fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
                  color: labelColor,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  transition: "color 200ms ease",
                  lineHeight: 1.2,
                }}
              >
                {step.label}
              </span>

              {/* Description (only for active step, non-compact) */}
              {!compact && status === "active" && step.description && (
                <span
                  style={{
                    fontSize: "0.625rem",
                    color: t.textMuted,
                    textAlign: "center",
                    marginTop: "-2px",
                  }}
                >
                  {step.description}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProgressTracker;
