"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../components/ui/ThemeContext";
import { ViewShell } from "../../components/layout/ViewShell";
import { Breadcrumb } from "../../components/layout/Breadcrumb";
import { fetchTools } from "../../lib/data";
import type { Tool } from "../../lib/appwrite";

// ---- Types ----

type ViewMode = "aesthetic" | "function";

const SEVEN_AESTHETICS = [
  { name: "Metal Heart", color: "#6B7280", description: "Industrial, raw, exposed surface" },
  { name: "GXSC", color: "#C4714A", description: "Styled but structured baseline" },
  { name: "Grunge", color: "#92400E", description: "Textured, degraded, anti-polished" },
  { name: "Minimalist", color: "#9AA0A6", description: "Maximum reduction, typographic hierarchy" },
  { name: "Corporate", color: "#2563EB", description: "Professional, trust-signaling" },
  { name: "Futuristic", color: "#7C3AED", description: "Tech-forward, dark-native, gradient-heavy" },
  { name: "Playful", color: "#F59E0B", description: "Bright, rounded, friendly" },
];

// ---- Helper: Parse type JSON string ----

function parseType(typeStr: string): { name?: string; role?: string; variant?: string } {
  if (!typeStr) return {};
  try {
    return JSON.parse(typeStr);
  } catch {
    return {};
  }
}

// ---- Helper: Render design tokens ----

function renderTokens(tokens: Record<string, string> | undefined): React.ReactNode {
  if (!tokens || Object.keys(tokens).length === 0) return <span style={{ opacity: 0.4 }}>—</span>;
  return (
    <div style={{ display: "grid", gap: "4px" }}>
      {Object.entries(tokens).slice(0, 6).map(([key, value]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {key === "backgroundColor" && value && (
            <div style={{ width: "14px", height: "14px", borderRadius: "3px", backgroundColor: value, border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }} />
          )}
          <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono', monospace", minWidth: "90px" }}>{key}</span>
          <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.8)", fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "—"}</span>
        </div>
      ))}
    </div>
  );
}

// ---- Component Card ----

function ComponentCard({ tool, onSelect }: { tool: Tool; onSelect: (t: Tool) => void }) {
  const { tokens } = useTheme();
  const aestheticMeta = SEVEN_AESTHETICS.find(a => a.name === tool.aestheticCategory);
  const typeInfo = parseType(tool.type);

  const previewStyle: React.CSSProperties = {
    backgroundColor: tool.designTokens?.backgroundColor || tokens.bgHover,
    color: tool.designTokens?.color || tokens.text,
    borderRadius: tool.designTokens?.borderRadius || tokens.radii?.md || "6px",
    padding: tool.designTokens?.padding || "12px",
    fontSize: tool.designTokens?.fontSize || "12px",
    fontFamily: tool.designTokens?.fontFamily || "inherit",
    border: tool.designTokens?.border || "none",
    boxShadow: tool.designTokens?.boxShadow || "none",
    minHeight: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  return (
    <div
      onClick={() => onSelect(tool)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onSelect(tool); }}
      style={{
        cursor: "pointer",
        backgroundColor: tokens.bgHover,
        border: `1px solid ${tokens.border}`,
        borderRadius: tokens.radii?.md || "6px",
        overflow: "hidden",
        transition: "border-color 150ms ease, transform 150ms ease",
      }}
      className="hover:border-accent hover:-translate-y-0.5"
    >
      {/* Visual Preview */}
      <div style={{ padding: "12px", borderBottom: `1px solid ${tokens.border}` }}>
        <div style={previewStyle}>
          {tool.designTokens?.backgroundColor && (
            <div style={{ width: "40px", height: "24px", borderRadius: "4px", background: tool.designTokens.backgroundColor }} />
          )}
          <span style={{ marginLeft: "8px", fontSize: "11px", color: tool.designTokens?.color || tokens.text }}>
            {tool.name}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "8px 12px" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: tokens.text, fontFamily: "'Space Grotesk', sans-serif" }}>
          {tool.name}
        </div>
        <div style={{ display: "flex", gap: "4px", marginTop: "4px", flexWrap: "wrap" }}>
          <span style={{
            fontSize: "0.6rem",
            padding: "2px 6px",
            borderRadius: "9999px",
            backgroundColor: `${aestheticMeta?.color || tokens.accent}20`,
            color: aestheticMeta?.color || tokens.accent,
          }}>
            {tool.aestheticCategory || "—"}
          </span>
          <span style={{
            fontSize: "0.6rem",
            padding: "2px 6px",
            borderRadius: "9999px",
            backgroundColor: `${tokens.textMuted}20`,
            color: tokens.textMuted,
          }}>
            {typeInfo.role || tool.type || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- Detail Panel ----

function DetailPanel({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  const { tokens } = useTheme();
  const aestheticMeta = SEVEN_AESTHETICS.find(a => a.name === tool.aestheticCategory);
  const typeInfo = parseType(tool.type);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "420px",
        height: "100vh",
        backgroundColor: tokens.bg,
        borderLeft: `1px solid ${tokens.border}`,
        boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
        zIndex: 100,
        overflow: "auto",
        padding: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: tokens.text }}>
          {tool.name}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: `1px solid ${tokens.border}`,
            borderRadius: tokens.radii?.sm || "4px",
            color: tokens.textMuted,
            fontSize: "0.75rem",
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* Tags */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.65rem", padding: "3px 8px", borderRadius: "9999px", backgroundColor: `${aestheticMeta?.color}20`, color: aestheticMeta?.color, fontWeight: 600 }}>
          {tool.aestheticCategory || "—"}
        </span>
        <span style={{ fontSize: "0.65rem", padding: "3px 8px", borderRadius: "9999px", backgroundColor: `${tokens.textMuted}20`, color: tokens.textMuted }}>
          {typeInfo.role || "—"}
        </span>
        <span style={{ fontSize: "0.65rem", padding: "3px 8px", borderRadius: "9999px", backgroundColor: `${tokens.accent}15`, color: tokens.accent }}>
          {typeInfo.variant || "—"}
        </span>
      </div>

      {/* Description */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.textDisabled, marginBottom: "4px" }}>
          Description
        </div>
        <p style={{ fontSize: "0.8125rem", color: tokens.text, lineHeight: 1.5, margin: 0 }}>
          {tool.description || "—"}
        </p>
      </div>

      {/* Type Info (parsed from JSON) */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.textDisabled, marginBottom: "8px" }}>
          Type (parsed)
        </div>
        <div style={{ display: "grid", gap: "4px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ fontSize: "0.65rem", color: tokens.textMuted, minWidth: "60px" }}>name</span>
            <span style={{ fontSize: "0.65rem", color: tokens.text, fontFamily: "'JetBrains Mono', monospace" }}>{typeInfo.name || "—"}</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ fontSize: "0.65rem", color: tokens.textMuted, minWidth: "60px" }}>role</span>
            <span style={{ fontSize: "0.65rem", color: tokens.text, fontFamily: "'JetBrains Mono', monospace" }}>{typeInfo.role || "—"}</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ fontSize: "0.65rem", color: tokens.textMuted, minWidth: "60px" }}>variant</span>
            <span style={{ fontSize: "0.65rem", color: tokens.text, fontFamily: "'JetBrains Mono', monospace" }}>{typeInfo.variant || "—"}</span>
          </div>
        </div>
      </div>

      {/* Design Tokens */}
      <div>
        <div style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.textDisabled, marginBottom: "8px" }}>
          Design Tokens
        </div>
        {renderTokens(tool.designTokens)}
      </div>
    </div>
  );
}

// ---- Main Page ----

export default function CatalogPage() {
  const { tokens } = useTheme();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAesthetic, setSelectedAesthetic] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  useEffect(() => {
    async function loadTools() {
      try {
        setLoading(true);
        const data = await fetchTools();
        setTools(data);
      } catch (err) {
        console.error("Failed to load tools:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTools();
  }, []);

  const filteredTools = useMemo(() => {
    if (!selectedAesthetic) return tools;
    return tools.filter(t => t.aestheticCategory === selectedAesthetic);
  }, [tools, selectedAesthetic]);

  const grouped = useMemo(() => {
    const groups: Record<string, Tool[]> = {};
    for (const tool of filteredTools) {
      const key = tool.aestheticCategory || "Unclassified";
      if (!groups[key]) groups[key] = [];
      groups[key].push(tool);
    }
    return groups;
  }, [filteredTools]);

  return (
    <ViewShell>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Catalog" }]} />

      <div style={{ marginTop: "1rem" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: tokens.text }}>
              Component Catalog
            </h1>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: tokens.textMuted }}>
              {tools.length} components · Organized by visual aesthetics
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedAesthetic(null)}
            style={{
              background: !selectedAesthetic ? `${tokens.accent}30` : tokens.bgHover,
              color: !selectedAesthetic ? tokens.accent : tokens.textMuted,
              border: `1px solid ${!selectedAesthetic ? tokens.accent : tokens.border}`,
              borderRadius: "9999px",
              fontSize: "0.6875rem",
              padding: "4px 12px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            All ({tools.length})
          </button>
          {SEVEN_AESTHETICS.map((a) => {
            const count = tools.filter(t => t.aestheticCategory === a.name).length;
            return (
              <button
                key={a.name}
                onClick={() => setSelectedAesthetic(selectedAesthetic === a.name ? null : a.name)}
                style={{
                  background: selectedAesthetic === a.name ? `${a.color}30` : tokens.bgHover,
                  color: selectedAesthetic === a.name ? a.color : tokens.textMuted,
                  border: `1px solid ${selectedAesthetic === a.name ? a.color : tokens.border}`,
                  borderRadius: "9999px",
                  fontSize: "0.6875rem",
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {a.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Groups */}
        {loading ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} aria-hidden="true" style={{
                height: "4rem",
                borderRadius: tokens.radii?.sm || "4px",
                background: tokens.shimmerBase,
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }} />
            ))}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: tokens.textMuted, fontSize: "0.8125rem" }}>
            No components match your filter. Run seed_data.py to populate.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "2rem" }}>
            {Object.entries(grouped)
              .sort((a, b) => b[1].length - a[1].length)
              .map(([groupName, items]) => (
                <div key={groupName}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: tokens.text, fontFamily: "'Space Grotesk', sans-serif" }}>
                      {groupName}
                    </h3>
                    <span style={{ fontSize: "0.625rem", color: tokens.textDisabled, backgroundColor: tokens.bgHover, padding: "2px 8px", borderRadius: "9999px" }}>
                      {items.length}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                    {items.map((tool) => (
                      <ComponentCard key={tool.$id} tool={tool} onSelect={setSelectedTool} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedTool && (
        <DetailPanel tool={selectedTool} onClose={() => setSelectedTool(null)} />
      )}
    </ViewShell>
  );
}
