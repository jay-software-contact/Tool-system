import React from "react";
import { useTheme, ThemeTokens } from "../ui/ThemeContext";
import {
  Pipeline,
  PipelineStatus,
  PipelineListViewProps,
  PipelineListItemProps,
} from "./PipelineTypes";

// ---- Status Badge Config ----

const statusConfig: Record<
  PipelineStatus,
  { label: string; dotColor: string; bgAlpha: number }
> = {
  draft: { label: "Draft", dotColor: "#8a8a9a", bgAlpha: 0.12 },
  active: { label: "Active", dotColor: "#4caf50", bgAlpha: 0.15 },
  paused: { label: "Paused", dotColor: "#ff9800", bgAlpha: 0.15 },
  error: { label: "Error", dotColor: "#f44336", bgAlpha: 0.18 },
  completed: { label: "Done", dotColor: "#2196f3", bgAlpha: 0.15 },
};

// ---- Skeleton Row ----

function SkeletonRow({ tokens }: { tokens: ThemeTokens }) {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 120px 100px 80px 40px",
        gap: "12px",
        alignItems: "center",
        padding: "10px 16px",
        borderRadius: "6px",
        marginBottom: "4px",
        background: tokens.bg,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span
          style={{
            display: "inline-block",
            width: `${60 + Math.random() * 30}%`,
            height: "0.875rem",
            borderRadius: "3px",
            background: `linear-gradient(90deg, ${tokens.shimmerBase} 25%, ${tokens.shimmerHighlight} 50%, ${tokens.shimmerBase} 75%)`,
            backgroundSize: "200% 100%",
            animation: "pipeline-shimmer 1.5s ease-in-out infinite",
          }}
        />
        <span
          style={{
            display: "inline-block",
            width: `${40 + Math.random() * 20}%`,
            height: "0.6875rem",
            borderRadius: "3px",
            background: `linear-gradient(90deg, ${tokens.shimmerBase} 25%, ${tokens.shimmerHighlight} 50%, ${tokens.shimmerBase} 75%)`,
            backgroundSize: "200% 100%",
            animation: "pipeline-shimmer 1.5s ease-in-out infinite",
          }}
        />
      </div>
      {Array.from({ length: 3 }, (_, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: "60%",
            height: "0.75rem",
            borderRadius: "3px",
            background: tokens.shimmerBase,
            opacity: 0.5,
          }}
        />
      ))}
      <span
        style={{
          display: "inline-block",
          width: "28px",
          height: "28px",
          borderRadius: "4px",
          background: tokens.shimmerBase,
          opacity: 0.5,
        }}
      />
    </div>
  );
}

// ---- Action Button ----

function ActionButton({
  title,
  onClick,
  tokens,
  children,
  hoverBg,
  hoverColor,
}: {
  title: string;
  onClick: (e: React.MouseEvent) => void;
  tokens: ThemeTokens;
  children: React.ReactNode;
  hoverBg?: string;
  hoverColor?: string;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "28px",
        height: "28px",
        borderRadius: "4px",
        border: "none",
        background: hovered ? (hoverBg ?? tokens.bgHover) : "transparent",
        color: hovered ? (hoverColor ?? tokens.text) : tokens.textMuted,
        cursor: "pointer",
        padding: 0,
        transition: "background 120ms ease, color 120ms ease",
        fontSize: "0.875rem",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {children}
    </button>
  );
}

// ---- Pipeline List Item (internal) ----

function PipelineListItem({
  pipeline,
  isSelected,
  disabled,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
}: PipelineListItemProps) {
  const { tokens } = useTheme();
  const t = tokens;
  const cfg = statusConfig[pipeline.status];

  const rowBg = isSelected
    ? t.bgActive
    : undefined;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(pipeline);
    }
  };

  return (
    <div
      role="row"
      aria-selected={isSelected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect(pipeline)}
      onKeyDown={handleKeyDown}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 120px 100px 80px 40px",
        gap: "12px",
        alignItems: "center",
        padding: "10px 16px",
        borderRadius: "6px",
        marginBottom: "2px",
        cursor: disabled ? "not-allowed" : "pointer",
        background: rowBg,
        opacity: disabled ? 0.5 : 1,
        transition: "background 120ms ease, opacity 120ms ease",
        outline: "none",
        border: isSelected ? `1px solid ${t.accent}33` : "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!isSelected && !disabled) {
          (e.currentTarget as HTMLElement).style.background = t.bgHover;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.background = t.bg;
        }
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.outline = `2px solid ${t.accent}`;
        (e.currentTarget as HTMLElement).style.outlineOffset = "-2px";
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).style.outline = "none";
      }}
    >
      {/* Name + Description */}
      <div role="cell" style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: t.text,
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.3,
          }}
        >
          {pipeline.name}
        </div>
        {pipeline.description && (
          <div
            style={{
              fontSize: "0.75rem",
              color: t.textMuted,
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: "2px",
              lineHeight: 1.3,
            }}
          >
            {pipeline.description}
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div role="cell">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "2px 8px",
            borderRadius: "10px",
            fontSize: "0.6875rem",
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            background: `${cfg.dotColor}${Math.round(cfg.bgAlpha * 255)
              .toString(16)
              .padStart(2, "0")}`,
            color: cfg.dotColor,
            border: `1px solid ${cfg.dotColor}22`,
          }}
        >
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: cfg.dotColor,
              flexShrink: 0,
            }}
          />
          {cfg.label}
        </span>
      </div>

      {/* Steps / Tools count */}
      <div
        role="cell"
        style={{
          fontSize: "0.8125rem",
          color: t.textMuted,
          fontFamily: "'DM Sans', sans-serif",
          textAlign: "center",
        }}
      >
        {pipeline.steps.length} steps
        <span style={{ color: t.textDisabled, margin: "0 3px" }}>/</span>
        {pipeline.toolCount} tools
      </div>

      {/* Updated */}
      <div
        role="cell"
        style={{
          fontSize: "0.75rem",
          color: t.textDisabled,
          fontFamily: "'DM Sans', sans-serif",
          whiteSpace: "nowrap",
        }}
      >
        {new Date(pipeline.updatedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </div>

      {/* Actions */}
      <div
        role="cell"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "2px",
        }}
      >
        <ActionButton
          title="Edit pipeline"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(pipeline);
          }}
          tokens={t}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </ActionButton>
        <ActionButton
          title="Duplicate pipeline"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(pipeline);
          }}
          tokens={t}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </ActionButton>
        <ActionButton
          title="Delete pipeline"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(pipeline);
          }}
          tokens={t}
          hoverBg="#f4433618"
          hoverColor="#f44336"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </ActionButton>
      </div>
    </div>
  );
}

// ---- Empty State ----

function EmptyState({ tokens }: { tokens: ThemeTokens }) {
  return (
    <div
      role="status"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
        color: tokens.textMuted,
        fontFamily: "'DM Sans', sans-serif",
        textAlign: "center",
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginBottom: "12px", opacity: 0.4 }}
      >
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 12h4" />
        <path d="M14 12h4" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
      <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>
        No pipelines found
      </div>
      <div
        style={{
          fontSize: "0.75rem",
          color: tokens.textDisabled,
          marginTop: "4px",
        }}
      >
        Create a pipeline to get started
      </div>
    </div>
  );
}

// ---- Filter Bar ----

function FilterBar({
  tokens,
  filterText,
  onFilterTextChange,
  statusFilters,
  onStatusFilterChange,
}: {
  tokens: ThemeTokens;
  filterText: string;
  onFilterTextChange: (text: string) => void;
  statusFilters: PipelineStatus[];
  onStatusFilterChange: (statuses: PipelineStatus[]) => void;
}) {
  const allStatuses: PipelineStatus[] = [
    "draft",
    "active",
    "paused",
    "error",
    "completed",
  ];

  const toggleStatus = (s: PipelineStatus) => {
    const next = statusFilters.includes(s)
      ? statusFilters.filter((x) => x !== s)
      : [...statusFilters, s];
    onStatusFilterChange(next);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        flexWrap: "wrap",
      }}
    >
      {/* Search input */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flex: "1 1 200px",
          minWidth: "160px",
          padding: "5px 10px",
          borderRadius: "6px",
          background: tokens.bg,
          border: `1px solid ${tokens.border}`,
          transition: "border-color 120ms ease",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={tokens.textMuted}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={filterText}
          onChange={(e) => onFilterTextChange(e.target.value)}
          placeholder="Filter pipelines..."
          aria-label="Filter pipelines"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: tokens.text,
            fontSize: "0.8125rem",
            fontFamily: "'DM Sans', sans-serif",
            minWidth: 0,
          }}
        />
      </div>

      {/* Status filter pills */}
      <div
        role="group"
        aria-label="Filter by status"
        style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}
      >
        {allStatuses.map((s) => {
          const cfg = statusConfig[s];
          const isActive = statusFilters.includes(s);
          return (
            <button
              key={s}
              type="button"
              role="checkbox"
              aria-checked={isActive}
              onClick={() => toggleStatus(s)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "3px 8px",
                borderRadius: "10px",
                border: `1px solid ${isActive ? cfg.dotColor + "66" : tokens.border}`,
                background: isActive ? cfg.dotColor + "18" : "transparent",
                color: isActive ? cfg.dotColor : tokens.textMuted,
                fontSize: "0.6875rem",
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                cursor: "pointer",
                transition: "all 120ms ease",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: isActive ? cfg.dotColor : tokens.textDisabled,
                  flexShrink: 0,
                }}
              />
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Column Header ----

function ColumnHeader({ tokens }: { tokens: ThemeTokens }) {
  const headerStyle: React.CSSProperties = {
    fontSize: "0.6875rem",
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: tokens.textDisabled,
    padding: "0 16px 6px",
    borderBottom: `1px solid ${tokens.border}`,
    display: "grid",
    gridTemplateColumns: "1fr 120px 100px 80px 40px",
    gap: "12px",
    alignItems: "center",
  };

  return (
    <div role="rowheader" style={headerStyle}>
      <span>Pipeline</span>
      <span>Status</span>
      <span style={{ textAlign: "center" }}>Structure</span>
      <span style={{ textAlign: "center" }}>Updated</span>
      <span />
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
  filterText: externalFilter,
  statusFilters: externalStatusFilters,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusFilterChange,
  onFilterTextChange,
  className,
  ariaLabel = "Pipeline list",
}: PipelineListViewProps) {
  const { tokens } = useTheme();
  const t = tokens;

  // Internal filter state (uncontrolled fallback)
  const [internalFilter, setInternalFilter] = React.useState("");
  const [internalStatusFilters, setInternalStatusFilters] = React.useState<
    PipelineStatus[]
  >([]);

  const isFilterControlled = externalFilter !== undefined;
  const isStatusControlled = externalStatusFilters !== undefined;
  const activeFilter = isFilterControlled ? externalFilter : internalFilter;
  const activeStatusFilters = isStatusControlled
    ? externalStatusFilters
    : internalStatusFilters;

  const handleFilterChange = (text: string) => {
    if (!isFilterControlled) setInternalFilter(text);
    onFilterTextChange?.(text);
  };

  const handleStatusChange = (statuses: PipelineStatus[]) => {
    if (!isStatusControlled) setInternalStatusFilters(statuses);
    onStatusFilterChange?.(statuses);
  };

  // Filter pipelines
  const filtered = React.useMemo(() => {
    let result = pipelines;

    if (activeFilter.trim()) {
      const q = activeFilter.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (activeStatusFilters.length > 0) {
      result = result.filter((p) => activeStatusFilters.includes(p.status));
    }

    return result;
  }, [pipelines, activeFilter, activeStatusFilters]);

  // Default action handlers (no-ops if not provided)
  const handleSelect = (pipeline: Pipeline) => onSelect?.(pipeline);
  const handleEdit = (pipeline: Pipeline) => onEdit?.(pipeline);
  const handleDelete = (pipeline: Pipeline) => onDelete?.(pipeline);
  const handleDuplicate = (pipeline: Pipeline) => onDuplicate?.(pipeline);

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        fontFamily: "'DM Sans', sans-serif",
        color: t.text,
      }}
    >
      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes pipeline-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Filter Bar */}
      {!loading && pipelines.length > 0 && (
        <FilterBar
          tokens={t}
          filterText={activeFilter}
          onFilterTextChange={handleFilterChange}
          statusFilters={activeStatusFilters}
          onStatusFilterChange={handleStatusChange}
        />
      )}

      {/* Column Headers */}
      {!loading && filtered.length > 0 && <ColumnHeader tokens={t} />}

      {/* List Body */}
      <div
        role="list"
        aria-busy={loading}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px 0",
        }}
      >
        {loading ? (
          <>
            {Array.from({ length: Math.max(1, loadingCount) }, (_, i) => (
              <SkeletonRow key={i} tokens={t} />
            ))}
          </>
        ) : filtered.length === 0 ? (
          <EmptyState tokens={t} />
        ) : (
          filtered.map((pipeline) => (
            <PipelineListItem
              key={pipeline.id}
              pipeline={pipeline}
              isSelected={pipeline.id === selectedId}
              disabled={disabled}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))
        )}
      </div>

      {/* Footer summary */}
      {!loading && filtered.length > 0 && (
        <div
          style={{
            padding: "6px 16px",
            borderTop: `1px solid ${t.border}`,
            fontSize: "0.6875rem",
            color: t.textDisabled,
            fontFamily: "'DM Sans', sans-serif",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>
            {filtered.length} pipeline{filtered.length !== 1 ? "s" : ""}
          </span>
          <span>
            {filtered.reduce((sum, p) => sum + p.steps.length, 0)} total steps
          </span>
        </div>
      )}
    </div>
  );
}

export default PipelineListView;
