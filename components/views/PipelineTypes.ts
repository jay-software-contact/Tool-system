// ---- Pipeline Domain Types ----
// Shared between PipelineListView and PipelineEditorView.

/** Possible states for a pipeline */
export type PipelineStatus =
  | "draft"
  | "active"
  | "paused"
  | "error"
  | "completed";

/** A single tool/node inside a pipeline step */
export interface PipelineTool {
  /** Unique tool identifier */
  id: string;
  /** Display name */
  name: string;
  /** Tool category / role (e.g. "input", "transform", "output", "decision") */
  role: string;
  /** Optional icon identifier or React node */
  icon?: string;
  /** Whether this tool slot is filled */
  filled: boolean;
}

/** A single step (stage) in a pipeline */
export interface PipelineStep {
  /** Unique step identifier */
  id: string;
  /** Display label */
  label: string;
  /** Zero-based ordering index */
  order: number;
  /** Tools assigned to this step */
  tools: PipelineTool[];
  /** Whether this step passes validation */
  valid: boolean;
}

/** Pipeline metadata for list display */
export interface Pipeline {
  /** Unique pipeline identifier */
  id: string;
  /** Display name */
  name: string;
  /** Optional description */
  description?: string;
  /** Current lifecycle status */
  status: PipelineStatus;
  /** Ordered steps comprising this pipeline */
  steps: PipelineStep[];
  /** ISO-8601 creation timestamp */
  createdAt: string;
  /** ISO-8601 last-updated timestamp */
  updatedAt: string;
  /** Number of tools across all steps */
  toolCount: number;
  /** Optional tags for filtering */
  tags?: string[];
}

/** Props accepted by PipelineListView */
export interface PipelineListViewProps {
  /** Pipelines to render */
  pipelines: Pipeline[];
  /** When true, shows skeleton loading state */
  loading?: boolean;
  /** Number of skeleton rows in loading state; defaults to 5 */
  loadingCount?: number;
  /** Controlled selected pipeline id */
  selectedId?: string;
  /** When true, the entire list is non-interactive */
  disabled?: boolean;
  /** Optional filter text for search (controlled) */
  filterText?: string;
  /** Available status filters */
  statusFilters?: PipelineStatus[];
  /** Callback when a pipeline row is selected */
  onSelect?: (pipeline: Pipeline) => void;
  /** Callback when edit action is triggered */
  onEdit?: (pipeline: Pipeline) => void;
  /** Callback when delete action is triggered */
  onDelete?: (pipeline: Pipeline) => void;
  /** Callback when duplicate action is triggered */
  onDuplicate?: (pipeline: Pipeline) => void;
  /** Callback when status filter changes */
  onStatusFilterChange?: (statuses: PipelineStatus[]) => void;
  /** Callback when filter text changes */
  onFilterTextChange?: (text: string) => void;
  /** Additional className for the wrapper */
  className?: string;
  /** Accessible label for the list region */
  ariaLabel?: string;
}

/** Props accepted by PipelineListItem (internal) */
export interface PipelineListItemProps {
  pipeline: Pipeline;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (pipeline: Pipeline) => void;
  onEdit: (pipeline: Pipeline) => void;
  onDelete: (pipeline: Pipeline) => void;
  onDuplicate: (pipeline: Pipeline) => void;
}
