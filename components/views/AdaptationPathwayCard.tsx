import React from "react";
import { useTheme } from "../ui/ThemeContext";
import type { AdaptationPathway, AdaptationStep } from "../../lib/engine";

// ---- Types ----

interface AdaptationPathwayCardProps {
  pathway: AdaptationPathway;
  sourceName?: string;
  className?: string;
}

interface AdaptationStepBadgeProps {
  step: AdaptationStep;
}

// ---- Action Badge Config ----

const actionConfig: Record<string, { bg: string; text: string; icon: string }> = {
  restructure: { bg: "rgba(126, 200, 227, 0.15)", text: "#7ec8e3", icon: "⟲" },
  restyle: { bg: "rgba(230, 168, 23, 0.15)", text: "#e6a817", icon: "◐" },
  reconnect: { bg: "rgba(168, 85, 247, 0.15)", text: "#a855f7", icon: "⟷" },
  extend: { bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e", icon: "+" },
  simplify: { bg: "rgba(156, 163, 175, 0.15)", text: "#9ca3af", icon: "−" },
};

// ---- Step Badge ----

function StepBadge({ step }: AdaptationStepBadgeProps) {
  const { tokens } = useTheme();
  const config = actionConfig[step.action] || actionConfig.restructure;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: "0.75rem",
        backgroundColor: tokens.bgHover,
        border: `1px solid ${tokens.border}`,
        borderRadius: tokens.radii?.sm || "4px",
      }}
    >
      {/* Action icon */}
      <div
        style={{
          width: "1.75rem",
          height: "1.75rem",
          borderRadius: "50%",
          backgroundColor: config.bg,
          color: config.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.875rem",
          flexShrink: 0,
          fontWeight: 700,
        }}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontSize: "0.625rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: config.text,
              backgroundColor: config.bg,
              padding: "0.125rem 0.375rem",
              borderRadius: "9999px",
            }}
          >
            {step.action}
          </span>
          <span style={{ fontSize: "0.625rem", color: tokens.textDisabled }}>
            {step.target}
          </span>
          <span style={{ marginLeft: "auto", display: "flex", gap: "2px" }}>
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: i < step.difficulty ? config.text : tokens.border,
                  opacity: i < step.difficulty ? 0.7 : 0.3,
                }}
              />
            ))}
          </span>
        </div>
        <p
          style={{
            margin: "0.375rem 0 0",
            fontSize: "0.75rem",
            color: tokens.textMuted,
            lineHeight: 1.4,
          }}
        >
          {step.description}
        </p>
      </div>
    </div>
  );
}

// ---- Pathway Card ----

export function AdaptationPathwayCard({ pathway, sourceName, className = "" }: AdaptationPathwayCardProps) {
  const { tokens } = useTheme();

  const effortLabel = pathway.effort <= 5 ? "Low" : pathway.effort <= 10 ? "Medium" : "High";
  const effortColor = pathway.effort <= 5 ? "#22c55e" : pathway.effort <= 10 ? "#eab308" : "#ef4444";

  return (
    <div
      className={className}
      style={{
        padding: "1rem",
        backgroundColor: tokens.bgHover,
        border: `1px solid ${tokens.border}`,
        borderRadius: tokens.radii?.lg || "8px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <div>
          <div style={{ fontSize: "0.625rem", color: tokens.textDisabled, marginBottom: "0.125rem" }}>
            {sourceName || pathway.fromId} → {pathway.toDomain}
          </div>
          <div style={{ display: "flex", gap: "0.375rem" }}>
            <span
              style={{
                fontSize: "0.625rem",
                padding: "0.125rem 0.375rem",
                borderRadius: "9999px",
                backgroundColor: `${effortColor}20`,
                color: effortColor,
                fontWeight: 600,
              }}
            >
              {effortLabel} effort ({pathway.effort})
            </span>
            <span
              style={{
                fontSize: "0.625rem",
                padding: "0.125rem 0.375rem",
                borderRadius: "9999px",
                backgroundColor: "rgba(126, 200, 227, 0.15)",
                color: "#7ec8e3",
              }}
            >
              → {pathway.resultType}
            </span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {pathway.steps.map((step, idx) => (
          <StepBadge key={idx} step={step} />
        ))}
      </div>

      {pathway.steps.length === 0 && (
        <p style={{ fontSize: "0.75rem", color: tokens.textMuted, textAlign: "center", padding: "1rem 0" }}>
          No adaptation needed — components are compatible.
        </p>
      )}
    </div>
  );
}

export default AdaptationPathwayCard;
