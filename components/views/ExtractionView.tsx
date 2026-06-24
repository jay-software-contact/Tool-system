import React, { useState, useCallback, useEffect, useRef } from "react";
import { useTheme, ThemeTokens } from "../ui/ThemeContext";

// ---- Types ----

export type StepStatus = "pending" | "active" | "completed";

export interface ExtractionStep {
  /** Unique step identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional description shown below the label */
  description?: string;
}

export interface ExtractionViewProps {
  /** Ordered list of extraction steps */
  steps: ExtractionStep[];
  /** Current active step index (0-based) */
  currentStep?: number;
  /** When true, the component manages its own step progression internally */
  autoProgress?: boolean;
  /** Interval in ms for auto-progression; defaults to 3000 */
  autoProgressInterval?: number;
  /** Whether the extraction is currently running */
  isRunning?: boolean;
  /** Callback fired when a step becomes active */
  onStepChange?: (stepIndex: number, step: ExtractionStep) => void;
  /** Callback fired when all steps are complete */
  onComplete?: () => void;
  /** Callback fired when the user clicks a completed step to navigate back */
  onStepClick?: (stepIndex: number, step: ExtractionStep) => void;
  /** Optional content rendered in the body area, receives current step index */
  children?: React.ReactNode | ((currentStep: number) => React.ReactNode);
  /** Additional className for the outer wrapper */
  className?: string;
  /** Show percentage progress bar at the top */
  showProgressBar?: boolean;
  /** Accessible label for the progress region */
  ariaLabel?: string;
}

// ---- Icon Components ----

function CheckIcon({ size = 18, color }: { size?: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SpinnerIcon({
  size = 18,
  color,
}: {
  size?: number;
  color: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ animation: "extraction-spin 1s linear infinite" }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ---- Style Helpers ----

function getStepCircleStyles(
  tokens: ThemeTokens,
  status: StepStatus,
  isClickable: boolean
): React.CSSProperties {
  const base: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 300ms ease",
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "0.875rem",
    fontWeight: 600,
    position: "relative",
  };

  switch (status) {
    case "completed":
      return {
        ...base,
        backgroundColor: tokens.accent,
        color: tokens.bg,
        border: `2px solid ${tokens.accent}`,
        boxShadow: `0 0 12px ${tokens.accent}40`,
      };
    case "active":
      return {
        ...base,
        backgroundColor: tokens.bgActive,
        color: tokens.textActive,
        border: `2px solid ${tokens.accent}`,
        boxShadow: `0 0 0 3px ${tokens.accent}30`,
      };
    case "pending":
    default:
      return {
        ...base,
        backgroundColor: tokens.bgHover,
        color: tokens.textMuted,
        border: `2px solid ${tokens.border}`,
      };
  }
}

function getConnectorStyles(
  tokens: ThemeTokens,
  status: StepStatus
): React.CSSProperties {
  return {
    flex: 1,
    height: 2,
    minWidth: 24,
    borderRadius: 1,
    backgroundColor:
      status === "completed"
        ? tokens.accent
        : status === "active"
          ? `${tokens.accent}50`
          : tokens.border,
    transition: "background-color 400ms ease",
    marginTop: -20, // align with circle centers
  };
}

function getLabelStyles(
  tokens: ThemeTokens,
  status: StepStatus
): React.CSSProperties {
  return {
    fontSize: "0.75rem",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: status === "active" ? 600 : status === "completed" ? 500 : 400,
    color:
      status === "completed"
        ? tokens.textActive
        : status === "active"
          ? tokens.text
          : tokens.textMuted,
    transition: "color 300ms ease",
    marginTop: 8,
    textAlign: "center" as const,
    lineHeight: 1.3,
    maxWidth: 100,
  };
}

function getDescriptionStyles(
  tokens: ThemeTokens,
  status: StepStatus
): React.CSSProperties {
  return {
    fontSize: "0.625rem",
    fontFamily: "'DM Sans', sans-serif",
    color: tokens.textDisabled,
    marginTop: 2,
    textAlign: "center" as const,
    lineHeight: 1.3,
    maxWidth: 100,
    opacity: status === "pending" ? 0.6 : 1,
  };
}

// ---- Step Component ----

function StepNode({
  step,
  index,
  status,
  tokens,
  onStepClick,
}: {
  step: ExtractionStep;
  index: number;
  status: StepStatus;
  tokens: ThemeTokens;
  onStepClick?: (index: number) => void;
}) {
  const isClickable = status === "completed" && !!onStepClick;
  const circleStyles = getStepCircleStyles(tokens, status, isClickable);

  const handleClick = () => {
    if (isClickable) {
      onStepClick?.(index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && isClickable) {
      e.preventDefault();
      onStepClick?.(index);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: status === "active" ? "0 0 auto" : 1,
        minWidth: 48,
      }}
      role="listitem"
      aria-current={status === "active" ? "step" : undefined}
      aria-label={`${step.label}: ${status}`}
    >
      {/* Circle */}
      <div
        style={{
          ...circleStyles,
          cursor: isClickable ? "pointer" : undefined,
          ...(isClickable ? { ":hover": undefined } : {}),
        }}
        onClick={isClickable ? handleClick : undefined}
        onKeyDown={isClickable ? handleKeyDown : undefined}
        tabIndex={isClickable ? 0 : undefined}
        role={isClickable ? "button" : undefined}
      >
        {status === "completed" ? (
          <CheckIcon size={18} color={tokens.bg} />
        ) : status === "active" ? (
          <SpinnerIcon size={18} color={tokens.accent} />
        ) : (
          <span>{index + 1}</span>
        )}
      </div>

      {/* Label */}
      <span style={getLabelStyles(tokens, status)}>{step.label}</span>

      {/* Description */}
      {step.description && (
        <span style={getDescriptionStyles(tokens, status)}>
          {step.description}
        </span>
      )}
    </div>
  );
}

// ---- Default Steps ----

const DEFAULT_STEPS: ExtractionStep[] = [
  { id: "input", label: "Input", description: "Upload data" },
  { id: "processing", label: "Processing", description: "Parse & validate" },
  { id: "extraction", label: "Extraction", description: "Extract entities" },
  { id: "complete", label: "Complete", description: "Results ready" },
];

// ---- Main Component ----

export function ExtractionView({
  steps = DEFAULT_STEPS,
  currentStep: controlledStep,
  autoProgress = false,
  autoProgressInterval = 3000,
  isRunning = false,
  onStepChange,
  onComplete,
  onStepClick,
  children,
  className,
  showProgressBar = true,
  ariaLabel = "Extraction Progress",
}: ExtractionViewProps) {
  const { tokens } = useTheme();
  const [internalStep, setInternalStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Use controlled or internal step
  const currentStep =
    controlledStep !== undefined ? controlledStep : internalStep;

  // Compute status for each step
  const getStepStatus = useCallback(
    (index: number): StepStatus => {
      if (index < currentStep) return "completed";
      if (index === currentStep) return "active";
      return "pending";
    },
    [currentStep]
  );

  // Auto-progress logic
  useEffect(() => {
    if (autoProgress) {
      intervalRef.current = setInterval(() => {
        setInternalStep((prev) => {
          const next = prev + 1;
          if (next >= steps.length) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            onCompleteRef.current?.();
            return prev;
          }
          onStepChange?.(next, steps[next]);
          return next;
        });
      }, autoProgressInterval);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [autoProgress, autoProgressInterval, steps.length, onStepChange]);

  // Manual navigation to a completed step
  const handleStepClick = useCallback(
    (index: number) => {
      if (index < currentStep) {
        setInternalStep(index);
        onStepClick?.(index, steps[index]);
      }
    },
    [currentStep, onStepClick, steps]
  );

  // Calculate progress percentage
  const progressPercent = Math.round((currentStep / (steps.length - 1)) * 100);

  // Completed count for screen readers
  const completedCount = currentStep;
  const totalSteps = steps.length;

  return (
    <div
      className={className}
      style={{
        backgroundColor: tokens.bg,
        borderRadius: 12,
        padding: "24px 20px 20px",
        border: `1px solid ${tokens.border}`,
        maxWidth: 720,
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
      role="region"
      aria-label={ariaLabel}
      aria-describedby="extraction-progress-desc"
    >
      {/* Inject keyframe animations */}
      <style>{`
        @keyframes extraction-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes extraction-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes extraction-bar-fill {
          from { width: 0%; }
        }
        @keyframes extraction-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Screen-reader description */}
      <span
        id="extraction-progress-desc"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}
      >
        Step {currentStep + 1} of {totalSteps}. {completedCount} completed.
      </span>

      {/* Progress bar */}
      {showProgressBar && (
        <div
          style={{
            marginBottom: 24,
            height: 4,
            backgroundColor: tokens.bgHover,
            borderRadius: 2,
            overflow: "hidden",
          }}
          role="progressbar"
          aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress: ${progressPercent}%`}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(progressPercent, 100)}%`,
                backgroundColor: tokens.accent,
                borderRadius: 2,
                transition: "width 500ms ease",
                boxShadow: `0 0 8px ${tokens.accent}50`,
              }}
            />
          </div>
      )}

      {/* Step title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h3
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "1rem",
            fontWeight: 600,
            color: tokens.text,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {steps[currentStep]?.label ?? "Extraction"}
        </h3>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.75rem",
            color: tokens.textMuted,
            animation: isRunning ? "extraction-pulse 2s ease-in-out infinite" : undefined,
          }}
        >
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Steps tracker */}
      <div
        role="list"
        aria-label="Extraction steps"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 4,
          paddingBottom: 16,
        }}
      >
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step node */}
            <StepNode
              step={step}
              index={index}
              status={getStepStatus(index)}
              tokens={tokens}
              onStepClick={handleStepClick}
            />

            {/* Connector between steps */}
            {index < steps.length - 1 && (
              <div
                style={getConnectorStyles(tokens, getStepStatus(index))}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Body content area */}
      <div
        style={{
          marginTop: 20,
          minHeight: 120,
          padding: 16,
          borderRadius: 8,
          backgroundColor: tokens.bgHover,
          border: `1px solid ${tokens.border}`,
          animation: "extraction-fade-in 300ms ease",
        }}
      >
        {typeof children === "function" ? children(currentStep) : children}
      </div>

      {/* Footer status message */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.6875rem",
            color: tokens.textDisabled,
          }}
        >
          {currentStep === steps.length - 1 && getStepStatus(currentStep) === "completed"
            ? "All steps complete"
            : `Working on: ${steps[currentStep]?.label ?? "..."}`}
        </span>

        {currentStep === steps.length - 1 &&
          getStepStatus(currentStep) === "completed" && (
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.6875rem",
                color: tokens.textActive,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <CheckIcon size={12} color={tokens.textActive} />
              Done
            </span>
          )}
      </div>
    </div>
  );
}

export default ExtractionView;
