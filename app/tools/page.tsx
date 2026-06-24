"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "../../components/ui/ThemeContext";
import { ViewShell } from "../../components/layout/ViewShell";
import { fetchTools, isUsingAppwrite } from "../../lib/data";
import type { Tool } from "../../lib/appwrite";

// Helper to ensure string for display
function str(val: unknown): string {
  if (val == null) return "—";
  return String(val);
}

export default function ToolsPage() {
  const { tokens } = useTheme();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    async function loadTools() {
      try {
        setLoading(true);
        const data = await fetchTools();
        setTools(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tools");
      } finally {
        setLoading(false);
      }
    }
    loadTools();
  }, []);

  const filteredTools = tools.filter((t) => {
    if (!filterText) return true;
    const flt = filterText.toLowerCase();
    return t.name.toLowerCase().includes(flt) ||
    (t.description || "").toLowerCase().includes(flt) ||
    (t.aestheticCategory || "").toLowerCase().includes(flt);
  });

  return (
    <ViewShell>
      <div style={{ padding: "0" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                color: tokens.text,
              }}
            >
              Tools
            </h1>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: tokens.textMuted }}>
              {tools.length} tools registered · {filteredTools.length} shown
            </p>
          </div>

          <input
            type="text"
            placeholder="Filter by name, domain, or tag..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
              background: tokens.bgHover,
              border: `1px solid ${tokens.border}`,
              borderRadius: tokens.radii?.sm || "4px",
              color: tokens.text,
              fontSize: "0.75rem",
              padding: "0.5rem 0.75rem",
              outline: "none",
              width: "240px",
            }}
          />
        </div>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            style={{
              padding: "1rem",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: tokens.radii?.sm || "4px",
              color: "#ef4444",
              fontSize: "0.8125rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  height: "4rem",
                  borderRadius: tokens.radii?.sm || "4px",
                  background: tokens.shimmerBase,
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
            ))}
          </div>
        )}

        {/* Tool list */}
        {!loading && !error && (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {filteredTools.length === 0 ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: tokens.textMuted,
                  fontSize: "0.8125rem",
                }}
              >
                {filterText ? "No tools match your filter." : "No tools found."}
              </div>
            ) : (
              filteredTools.map((tool) => (
                <ToolCard key={tool.$id} tool={tool} tokens={tokens} />
              ))
            )}
          </div>
        )}
      </div>
    </ViewShell>
  );
}

function ToolCard({ tool, tokens }: { tool: Tool; tokens: ReturnType<typeof useTheme>["tokens"] }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "1rem",
        padding: "0.75rem 1rem",
        backgroundColor: tokens.bgHover,
        border: `1px solid ${tokens.border}`,
        borderRadius: tokens.radii?.sm || "4px",
        transition: "border-color 150ms ease",
      }}
    >
      {/* Icon placeholder */}
      <div
        style={{
          width: "2.5rem",
          height: "2.5rem",
          borderRadius: tokens.radii?.sm || "4px",
          backgroundColor: tokens.bgActive,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "1rem",
        }}
      >
        {tool.name.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <strong
            style={{
              fontSize: "0.875rem",
              color: tokens.text,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {tool.name}
          </strong>
          {tool.status && (
            <span
              style={{
                fontSize: "0.625rem",
                padding: "0.125rem 0.375rem",
                borderRadius: "9999px",
                backgroundColor: tool.status === "active" ? "rgba(34, 197, 94, 0.2)" : "rgba(156, 163, 175, 0.2)",
                color: tool.status === "active" ? "#22c55e" : "#9ca3af",
              }}
            >
              {str(tool.status)}
            </span>
          )}
        </div>

        {tool.description && (
          <p
            style={{
              margin: "0.25rem 0",
              fontSize: "0.75rem",
              color: tokens.textMuted,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {tool.description}
          </p>
        )}

        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginTop: "0.375rem" }}>
          {tool.domain && (
            <span style={tagStyle(tokens, "domain")}>{tool.domain}</span>
          )}
          {tool.category && (
            <span style={tagStyle(tokens, "category")}>{tool.category}</span>
          )}
          {(tool.tags || []).slice(0, 3).map((tag) => (
            <span key={tag} style={tagStyle(tokens, "tag")}>{tag}</span>
          ))}
          {(tool.tags || []).length > 3 && (
            <span style={{ ...tagStyle(tokens, "tag"), opacity: 0.5 }}>
              +{(tool.tags || []).length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function tagStyle(tokens: ReturnType<typeof useTheme>["tokens"], variant: "domain" | "category" | "tag"): React.CSSProperties {
  const colors = {
    domain: { bg: "rgba(230, 168, 23, 0.15)", text: "#e6a817" },
    category: { bg: "rgba(126, 200, 227, 0.15)", text: "#7ec8e3" },
    tag: { bg: "rgba(156, 163, 175, 0.15)", text: "#9ca3af" },
  };
  const c = colors[variant];
  return {
    fontSize: "0.625rem",
    padding: "0.125rem 0.375rem",
    borderRadius: "9999px",
    backgroundColor: c.bg,
    color: c.text,
  };
}
