import React from "react";
import { useTheme } from "./ui/ThemeContext";

// ---- Types ----

export interface ExtractionField {
  key: string;
  label: string;
  value: string;
  confidence: number; // 0-1
  source?: string;
}

export interface ExtractionViewProps {
  /** The extracted data fields */
  fields?: ExtractionField[];
  /** Source document or URL being extracted from */
  source?: string;
  /** Whether extraction is in progress */
  loading?: boolean;
  /** Error message if extraction failed */
  error?: string | null;
  /** Called when user copies all extracted data */
  onCopyAll?: () => void;
  /** Called when user re-runs extraction */
  onRetry?: () => void;
  /** Current prompt text for extraction input */
  prompt?: string;
  /** Called when the prompt textarea changes */
  onPromptChange?: (value: string) => void;
  /** Called when the user clicks Run to start extraction */
  onRun?: () => void;
  /** Whether the Run button is disabled */
  runDisabled?: boolean;
  /** Additional className */
  className?: string;
}

// ---- Helpers ----

function getConfidenceColor(tokens: ReturnType<typeof useTheme>["tokens"], confidence: number): string {
  if (confidence >= 0.85) return "#4ade80"; // green
  if (confidence >= 0.6) return tokens.accent; // amber/teal per theme
  return "#f87171"; // red
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.85) return "high";
  if (confidence >= 0.6) return "medium";
  return "low";
}

// ---- Skeleton Row ----

function SkeletonRow({ tokens }: { tokens: ReturnType<typeof useTheme>["tokens"] }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 14px",
        borderBottom: `1px solid ${tokens.border}`,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          width: "80px",
          height: "0.75rem",
          borderRadius: "2px",
          background: `linear-gradient(90deg, ${tokens.shimmerBase} 25%, ${tokens.shimmerHighlight} 50%, ${tokens.shimmerBase} 75%)`,
          backgroundSize: "200% 100%",
          animation: "extraction-shimmer 1.5s ease-in-out infinite",
        }}
      />
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          flex: 1,
          height: "0.75rem",
          borderRadius: "2px",
          background: `linear-gradient(90deg, ${tokens.shimmerBase} 25%, ${tokens.shimmerHighlight} 50%, ${tokens.shimmerBase} 75%)`,
          backgroundSize: "200% 100%",
          animation: "extraction-shimmer 1.5s ease-in-out infinite 0.15s",
        }}
      />
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          width: "48px",
          height: "0.65rem",
          borderRadius: "999px",
          background: `linear-gradient(90deg, ${tokens.shimmerBase} 25%, ${tokens.shimmerHighlight} 50%, ${tokens.shimmerBase} 75%)`,
          backgroundSize: "200% 100%",
          animation: "extraction-shimmer 1.5s ease-in-out infinite 0.3s",
        }}
      />
    </div>
  );
}

// ---- Field Row ----

function FieldRow({
  field,
  tokens,
}: {
  field: ExtractionField;
  tokens: ReturnType<typeof useTheme>["tokens"];
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(field.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  const confColor = getConfidenceColor(tokens, field.confidence);
  const confLabel = getConfidenceLabel(field.confidence);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "10px 14px",
        borderBottom: `1px solid ${tokens.border}`,
        transition: "background-color 120ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = tokens.bgHover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
      }}
    >
      {/* Field label */}
      <div
        style={{
          minWidth: "120px",
          maxWidth: "180px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            color: tokens.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {field.label}
        </span>
      </div>

      {/* Value */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: "0.875rem",
            fontFamily: "'DM Sans', sans-serif",
            color: tokens.text,
            lineHeight: 1.5,
            wordBreak: "break-word",
          }}
        >
          {field.value}
        </span>
        {field.source && (
          <span
            style={{
              display: "block",
              marginTop: "2px",
              fontSize: "0.6875rem",
              fontFamily: "'DM Sans', sans-serif",
              color: tokens.textDisabled,
            }}
          >
            src: {field.source}
          </span>
        )}
      </div>

      {/* Confidence badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexShrink: 0,
        }}
      >
        <span
          aria-label={`Confidence: ${confLabel}`}
          style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: confColor,
          }}
        />
        <span
          style={{
            fontSize: "0.6875rem",
            fontFamily: "'DM Sans', sans-serif",
            color: confColor,
            fontWeight: 500,
          }}
        >
          {confLabel}
        </span>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        title="Copy value"
        style={{
          background: "none",
          border: "none",
          padding: "4px",
          cursor: "pointer",
          color: copied ? "#4ade80" : tokens.textDisabled,
          transition: "color 120ms ease",
          display: "flex",
          alignItems: "center",
          borderRadius: "3px",
          flexShrink: 0,
        }}
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ---- Main Component ----

export function ExtractionView({
  fields = [],
  source,
  loading = false,
  error = null,
  onCopyAll,
  onRetry,
  prompt = "",
  onPromptChange,
  onRun,
  runDisabled = false,
  className,
}: ExtractionViewProps) {
  const { tokens } = useTheme();
  const t = tokens;

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: "8px",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Keyframe styles for shimmer */}
      <style>{`
        @keyframes extraction-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: `1px solid ${t.border}`,
          backgroundColor: t.bgActive,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <h2
            style={{
              margin: 0,
              fontSize: "0.9375rem",
              fontWeight: 600,
              fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
              color: t.text,
              letterSpacing: "0.01em",
            }}
          >
            Extraction Results
          </h2>
          {!loading && fields.length > 0 && (
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                color: t.textMuted,
                backgroundColor: t.bg,
                padding: "2px 8px",
                borderRadius: "999px",
                border: `1px solid ${t.border}`,
              }}
            >
              {fields.length} field{fields.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {onCopyAll && !loading && fields.length > 0 && (
            <button
              onClick={onCopyAll}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 10px",
                fontSize: "0.75rem",
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                color: t.text,
                backgroundColor: t.bg,
                border: `1px solid ${t.border}`,
                borderRadius: "4px",
                cursor: "pointer",
                transition: "all 120ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = t.bgHover;
                (e.currentTarget as HTMLElement).style.borderColor = t.accent;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = t.bg;
                (e.currentTarget as HTMLElement).style.borderColor = t.border;
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy All
            </button>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 10px",
                fontSize: "0.75rem",
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                color: loading ? t.textDisabled : t.accent,
                backgroundColor: "transparent",
                border: `1px solid ${loading ? t.border : t.accent}`,
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 120ms ease",
                opacity: loading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = t.bgHover;
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
              </svg>
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Prompt input section */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${t.border}`,
          backgroundColor: t.bg,
        }}
      >
        <label
          htmlFor="extraction-prompt"
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "0.75rem",
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            color: t.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Project Prompt
        </label>
        <textarea
          id="extraction-prompt"
          value={prompt}
          onChange={(e) => onPromptChange?.(e.target.value)}
          placeholder="Enter your extraction prompt here..."
          rows={4}
          style={{
            width: "100%",
            minHeight: "80px",
            padding: "10px 12px",
            fontSize: "0.875rem",
            fontFamily: "'DM Sans', sans-serif",
            color: t.text,
            backgroundColor: t.bgActive,
            border: `1px solid ${t.border}`,
            borderRadius: "6px",
            resize: "vertical",
            outline: "none",
            lineHeight: 1.5,
            boxSizing: "border-box",
            transition: "border-color 120ms ease",
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLTextAreaElement).style.borderColor = t.accent;
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLTextAreaElement).style.borderColor = t.border;
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "10px",
          }}
        >
          <button
            onClick={onRun}
            disabled={runDisabled || loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
              color: runDisabled || loading ? t.textDisabled : "#000",
              backgroundColor: runDisabled || loading ? t.bgActive : t.accent,
              border: `1px solid ${runDisabled || loading ? t.border : t.accent}`,
              borderRadius: "6px",
              cursor: runDisabled || loading ? "not-allowed" : "pointer",
              transition: "all 120ms ease",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              if (!(runDisabled || loading)) {
                (e.currentTarget as HTMLElement).style.backgroundColor = t.accentHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!(runDisabled || loading)) {
                (e.currentTarget as HTMLElement).style.backgroundColor = t.accent;
              }
            }}
          >
            {loading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "extraction-shimmer 1s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Running...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Run
              </>
            )}
          </button>
        </div>
      </div>

      {/* Source indicator */}
      {source && !loading && (
        <div
          style={{
            padding: "6px 16px",
            fontSize: "0.6875rem",
            fontFamily: "'DM Sans', sans-serif",
            color: t.textDisabled,
            borderBottom: `1px solid ${t.border}`,
            backgroundColor: t.bg,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          Source: {source}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          style={{
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#f87171",
            fontSize: "0.875rem",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {loading ? (
          // Loading skeleton
          <>
            <SkeletonRow tokens={t} />
            <SkeletonRow tokens={t} />
            <SkeletonRow tokens={t} />
            <SkeletonRow tokens={t} />
            <SkeletonRow tokens={t} />
          </>
        ) : fields.length > 0 ? (
          // Field rows
          <>
            {fields.map((field) => (
              <FieldRow key={field.key} field={field} tokens={t} />
            ))}
          </>
        ) : !error ? (
          // Empty state
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px 24px",
              color: t.textMuted,
              gap: "12px",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span
              style={{
                fontSize: "0.875rem",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              No extraction data
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontFamily: "'DM Sans', sans-serif",
                color: t.textDisabled,
              }}
            >
              Submit a document to begin extraction
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ExtractionView;
