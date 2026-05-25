import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../components/ui/ThemeContext";
import {
  databases,
  APPWRITE_COLLECTIONS,
  Query,
} from "../lib/appwrite";

// ---- Types ----

/**
 * @typedef {Object} ActivityEntry
 * @property {string} $id - Appwrite document ID
 * @property {string} description - Activity description text
 * @property {string} [$createdAt] - ISO timestamp (Appwrite default)
 * @property {string} [timestamp] - Custom timestamp field
 */

export interface RecentActivityProps {
  /** Appwrite database ID */
  databaseId: string;
  /** Max number of entries to display; defaults to 5 */
  limit?: number;
  /** When true, polls for new entries every `pollIntervalMs` */
  live?: boolean;
  /** Polling interval in ms; defaults to 30000 (30 s) */
  pollIntervalMs?: number;
  /** Additional className for the wrapper */
  className?: string;
  /** Optional render function for each entry */
  renderEntry?: (entry: ActivityEntry, index: number) => React.ReactNode;
}

// ---- Helpers ----

function formatTimestamp(iso: string, tokens: { textMuted: string }): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function getTime(entry: ActivityEntry): string {
  return entry.timestamp || entry.$createdAt || "";
}

// ---- Skeleton ----

function SkeletonItem({ tokens }: { tokens: ReturnType<typeof useTheme>["tokens"] }) {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 0",
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          flexShrink: 0,
          background: tokens.shimmerBase,
        }}
      />
      <span
        style={{
          flex: 1,
          height: "0.6875rem",
          borderRadius: "2px",
          background: `linear-gradient(90deg, ${tokens.shimmerBase} 25%, ${tokens.shimmerHighlight} 50%, ${tokens.shimmerBase} 75%)`,
          backgroundSize: "200% 100%",
          animation: "activity-shimmer 1.5s ease-in-out infinite",
        }}
      />
      <span
        style={{
          width: "48px",
          height: "0.625rem",
          borderRadius: "2px",
          background: tokens.shimmerBase,
          flexShrink: 0,
        }}
      />
    </div>
  );
}

// ---- Default Entry Renderer ----

function DefaultEntry({
  entry,
  tokens,
  isLast,
}: {
  entry: ActivityEntry;
  tokens: ReturnType<typeof useTheme>["tokens"];
  isLast: boolean;
}) {
  const time = getTime(entry);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "8px 0",
        borderBottom: isLast ? "none" : `1px solid ${tokens.border}`,
      }}
    >
      {/* Dot indicator */}
      <span
        aria-hidden="true"
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: tokens.accent,
          flexShrink: 0,
          marginTop: "5px",
          opacity: 0.8,
        }}
      />
      {/* Description */}
      <span
        style={{
          flex: 1,
          fontSize: "0.8125rem",
          fontFamily: "'DM Sans', sans-serif",
          color: tokens.text,
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {entry.description}
      </span>
      {/* Timestamp */}
      <time
        dateTime={time}
        style={{
          flexShrink: 0,
          fontSize: "0.6875rem",
          fontFamily: "'DM Sans', sans-serif",
          color: tokens.textMuted,
          whiteSpace: "nowrap",
          marginTop: "2px",
        }}
      >
        {formatTimestamp(time, tokens)}
      </time>
    </div>
  );
}

// ---- Component ----

export function RecentActivity({
  databaseId,
  limit = 5,
  live = true,
  pollIntervalMs = 30000,
  className,
  renderEntry,
}: RecentActivityProps) {
  const { tokens } = useTheme();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = useCallback(async () => {
    try {
      setError(null);
      const res = await databases.listDocuments(
        databaseId,
        APPWRITE_COLLECTIONS.ACTIVITY_LOG,
        [
          Query.orderDesc("$createdAt"),
          Query.limit(limit),
        ]
      );
      setEntries(res.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activities");
    } finally {
      setLoading(false);
    }
  }, [databaseId, limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Live polling
  useEffect(() => {
    if (!live) return;
    const id = setInterval(fetchActivities, pollIntervalMs);
    return () => clearInterval(id);
  }, [live, pollIntervalMs, fetchActivities]);

  return (
    <section
      aria-label="Recent activity"
      className={className}
      style={{
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Shimmer keyframes (injected once) */}
      <style>{`
        @keyframes activity-shimmer {
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
          marginBottom: "4px",
        }}
      >
        <h3
          style={{
            fontSize: "0.875rem",
            fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
            fontWeight: 600,
            color: tokens.textActive,
            margin: 0,
            letterSpacing: "0.02em",
          }}
        >
          Recent Activity
        </h3>
        {live && !loading && (
          <span
            aria-hidden="true"
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: tokens.accent,
              opacity: 0.7,
            }}
          />
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div aria-busy="true" aria-label="Loading recent activity">
          {Array.from({ length: limit }, (_, i) => (
            <SkeletonItem key={i} tokens={tokens} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div
          role="alert"
          style={{
            padding: "10px 0",
            fontSize: "0.8125rem",
            color: tokens.textMuted,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Could not load activity.{" "}
          <button
            onClick={fetchActivities}
            style={{
              background: "none",
              border: "none",
              color: tokens.accent,
              cursor: "pointer",
              padding: 0,
              fontSize: "inherit",
              fontFamily: "inherit",
              textDecoration: "underline",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && entries.length === 0 && (
        <div
          style={{
            padding: "16px 0",
            fontSize: "0.8125rem",
            color: tokens.textMuted,
            fontFamily: "'DM Sans', sans-serif",
            textAlign: "center",
          }}
        >
          No recent activity.
        </div>
      )}

      {/* Entries */}
      {!loading && !error && entries.length > 0 && (
        <div>
          {entries.map((entry, i) =>
            renderEntry ? (
              <React.Fragment key={entry.$id}>
                {renderEntry(entry, i)}
              </React.Fragment>
            ) : (
              <DefaultEntry
                key={entry.$id}
                entry={entry}
                tokens={tokens}
                isLast={i === entries.length - 1}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}

export default RecentActivity;
