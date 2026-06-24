import React from "react";
import { useTheme } from "../ui/ThemeContext";
import type { PipelineDomain, PipelineStatus } from "../../lib/appwrite";

// ---- Types ----

interface PipelineListViewProps {
  pipelines: PipelineDomain[];
  loading?: boolean;
  loadingCount?: number;
  selectedId?: string;
  disabled?: boolean;
  filterText?: string;
  statusFilters?: PipelineStatus[];
  onSelect?: (pipeline: PipelineDomain) => void;
  onEdit?: (pipeline: PipelineDomain) => void;
  onDelete?: (pipeline: PipelineDomain) => void;
  onDuplicate?: (pipeline: PipelineDomain) => void;
  onStatusFilterChange?: (statuses: PipelineStatus[]) => void;
  onFilterTextChange?: (text: string) => void;
  className?: string;
  ariaLabel?: string;
}

// ---- Status Badge Config ----

const statusConfig: Record<PipelineStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: "rgba(156, 163, 175, 0.2)", text: "#9ca3af", label: "Draft" },
  active: { bg: "rgba(34, 197, 94, 0.2)", text: "#22c55e", label: "Active" },
  paused: { bg: "rgba(234, 179, 8, 0.2)", text: "#eab308", label: "Paused" },
  error: { bg: "rgba(239, 68, 68, 0.2)", text: "#ef4444", label: "Error" },
  completed: { bg: "rgba(59, 130, 246, 0.2)", text: "#3b82f6", label: "Completed" },
};

// ---- Pipeline List Item ----

function PipelineListItem({
  pipeline,
  isSelected,
  disabled,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  pipeline: PipelineDomain;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (p: PipelineDomain) => void;
  onEdit: (p: PipelineDomain) => void;
  onDelete: (p: PipelineDomain) => void;
  onDuplicate: (p: PipelineDomain) => void;
}) {
  const { tokens } = useTheme();
  const sc = statusConfig[pipeline.status];

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacing ? "1rem" : "1rem",
    padding: "0.75rem 1rem",
    backgroundColor: isSelected ? tokens.bgActive : "transparent",
    borderLeft: `3px solid ${isSelected ? tokens.accent : "transparent"}`,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "background-color 150ms ease",
  };

  return (
    <div
      style={rowStyle}
      onClick={() => !disabled && onSelect(pipeline)}
      role="option"
      aria-selected={isSelected}
      aria-label={`Pipeline: ${pipeline.name}`}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: tokens.text,
              fontFamily: "'Space Grotesk', sans-serif",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {pipeline.name}
          </span>
          <span
            style={{
              fontSize: "0.625rem",
              padding: "0.125rem 0.5rem",
              borderRadius: "9999px",
              backgroundColor: sc.bg,
              color: sc.text,
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {sc.label}
          </span>
        </div>
        {pipeline.description && (
          <div
            style={{
              fontSize: "0.75rem",
              color: tokens.textMuted,
              marginTop: "0.25rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {pipeline.description}
          </div>
        )}
        <div style={{ fontSize: "0.625rem", color: tokens.textDisabled, marginTop: "0.25rem" }}>
          {pipeline.toolCount} tools · {pipeline.steps.length} steps · {pipeline.domain || "no domain"}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
        {[
          { label: "Edit", fn: () => onEdit(pipeline) },
          { label: "Duplicate", fn: () => onDuplicate(pipeline) },
          { label: "Delete", fn: () => onDelete(pipeline) },
        ].map(({ label, fn }) => (
          <button
            key={label}
            onClick={(e) => { e.stopPropagation(); fn(); }}
            disabled={disabled}
            style={{
              background: "none",
              border: `1px solid ${tokens.border}`,
              borderRadius: tokens.radii?.sm || "4px",
              color: tokens.textMuted,
              fontSize: "0.625rem",
              padding: "0.25rem 0.5rem",
              cursor: disabled ? "not-allowed" : "pointer",
              transition: "color 150ms ease, border-color 150ms ease",
            }}
            aria-label={`${label} ${pipeline.name}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Skeleton ----

function SkeletonRow({ tokens }: { tokens: ReturnType<typeof useTheme>["tokens"] }) {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "0.75rem 1rem",
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: "0.875rem",
            width: "40%",
            borderRadius: "4px",
            background: tokens.shimmerBase,
            marginBottom: "0.375rem",
          }}
        />
        <div
          style={{
            height: "0.625rem",
            width: "70%",
            borderRadius: "4px",
            background: tokens.shimmerHighlight,
          }}
        />
      </div>
      <div
        style={{
          height: "1.5rem",
          width: "3.5rem",
          borderRadius: "9999px",
          background: tokens.shimmerBase,
        }}
      />
    </div>
  );
}

// ---- Main Component ----

export function PipelineListView({
  pipelines,
  loading = false,
  loadingCount = 5,
  selectedId,
  disabled = false,
  filterText = "",
  statusFilters,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusFilterChange,
  onFilterTextChange,
  className = "",
  ariaLabel = "Pipeline list",
}: PipelineListViewProps) {
  const { tokens } = useTheme();

  const filteredPipelines = pipelines.filter((p) => {
    if (filterText && !p.name.toLowerCase().includes(filterText.toLowerCase())) return false;
    if (statusFilters && statusFilters.length > 0 && !statusFilters.includes(p.status)) return false;
    return true;
  });

  const containerStyle: React.CSSProperties = {
    backgroundColor: tokens.bg,
    border: `1px solid ${tokens.border}`,
    borderRadius: tokens.radii?.lg || "8px",
    overflow: "hidden",
  };

  return (
    <div className={className} style={containerStyle} role="listbox" aria-label={ariaLabel}>
      {/* Header */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderBottom: `1px solid ${tokens.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "0.875rem",
            fontWeight: 600,
            color: tokens.text,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Pipelines ({filteredPipelines.length})
        </h3>

        {/* Filter input */}
        <input
          type="text"
          placeholder="Filter pipelines..."
          value={filterText}
          onChange={(e) => onFilterTextChange?.(e.target.value)}
          style={{
            background: tokens.bgHover,
            border: `1px solid ${tokens.border}`,
            borderRadius: tokens.radii?.sm || "4px",
            color: tokens.text,
            fontSize: "0.75rem",
            padding: "0.375rem 0.75rem",
            outline: "none",
            width: "200px",
          }}
          aria-label="Filter pipelines"
        />
      </div>

      {/* List */}
      <div>
        {loading ? (
          Array.from({ length: loadingCount }, (_, i) => (
            <SkeletonRow key={i} tokens={tokens} />
          ))
        ) : filteredPipelines.length === 0 ? (
          <div
            style={{
              padding: "2rem 1rem",
              textAlign: "center",
              color: tokens.textMuted,
              fontSize: "0.8125rem",
            }}
          >
            {filterText ? "No pipelines match your filter." : "No pipelines yet. Create one to get started."}
          </div>
        ) : (
          filteredPipelines.map((pipeline) => (
            <PipelineListItem
              key={pipeline.$id}
              pipeline={pipeline}
              isSelected={pipeline.$id === selectedId}
              disabled={disabled}
              onSelect={onSelect || (() => {})}
              onEdit={onEdit || (() => {})}
              onDelete={onDelete || (() => {})}
              onDuplicate={onDuplicate || (() => {})}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default PipelineListView;
