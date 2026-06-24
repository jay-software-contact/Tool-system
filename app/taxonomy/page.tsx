"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "../../components/ui/ThemeContext";
import { ViewShell } from "../../components/layout/ViewShell";
import { Breadcrumb } from "../../components/layout/Breadcrumb";
import { fetchTaxonomy } from "../../lib/data";
import type { AestheticTaxonomy } from "../../lib/appwrite";

export default function TaxonomyPage() {
  const { tokens } = useTheme();
  const [entries, setEntries] = useState<AestheticTaxonomy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<AestheticTaxonomy | null>(null);

  useEffect(() => {
    async function loadTaxonomy() {
      try {
        setLoading(true);
        const data = await fetchTaxonomy();
        setEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load taxonomy");
      } finally {
        setLoading(false);
      }
    }
    loadTaxonomy();
  }, []);

  // Group by level
  const rootEntries = entries.filter(e => e.level === 0);
  const childEntries = entries.filter(e => e.level > 0);

  return (
    <ViewShell>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Taxonomy" }]} />

      <div style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: tokens.text }}>
              Aesthetic Taxonomy
            </h1>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: tokens.textMuted }}>
              {entries.length} aesthetic classifications across {rootEntries.length} root categories
            </p>
          </div>
        </div>

        {error && (
          <div role="alert" style={{
            padding: "1rem",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: tokens.radii?.sm || "4px",
            color: "#ef4444",
            fontSize: "0.8125rem",
            marginBottom: "1rem",
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} aria-hidden="true" style={{
                height: "4rem",
                borderRadius: tokens.radii?.sm || "4px",
                background: tokens.shimmerBase,
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }} />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: tokens.textMuted, fontSize: "0.8125rem" }}>
            No taxonomy entries found. Run seed_data.py to populate.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {rootEntries.map(root => (
              <TaxonomyNode
                key={root.$id}
                node={root}
                children={childEntries.filter(c => (c.parentId || c.parent_id) === root.slug)}
                tokens={tokens}
                onSelect={setSelectedEntry}
                selectedId={selectedEntry?.$id}
              />
            ))}
          </div>
        )}

        {/* Detail panel */}
        {selectedEntry && (
          <TaxonomyDetail
            entry={selectedEntry}
            tokens={tokens}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </div>
    </ViewShell>
  );
}

function TaxonomyNode({
  node,
  children,
  tokens,
  onSelect,
  selectedId,
}: {
  node: AestheticTaxonomy;
  children: AestheticTaxonomy[];
  tokens: ReturnType<typeof useTheme>["tokens"];
  onSelect: (entry: AestheticTaxonomy) => void;
  selectedId?: string;
}) {
  const isSelected = node.$id === selectedId;

  return (
    <div>
      <div
        onClick={() => onSelect(node)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") onSelect(node); }}
        style={{
          padding: "1rem",
          backgroundColor: isSelected ? tokens.bgActive : tokens.bgHover,
          border: `1px solid ${isSelected ? tokens.accent : tokens.border}`,
          borderRadius: tokens.radii?.sm || "4px",
          cursor: "pointer",
          transition: "border-color 150ms ease, background-color 150ms ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1rem", fontWeight: 700, color: tokens.accent, fontFamily: "'Space Grotesk', sans-serif" }}>
            {node.name.charAt(0)}
          </span>
          <div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: tokens.text }}>
              {node.name}
            </div>
            {node.aesthetic_classification && (
              <div style={{ fontSize: "0.625rem", color: tokens.textMuted, marginTop: "0.125rem" }}>
                {node.aesthetic_classification}
              </div>
            )}
          </div>
        </div>
        {node.perceptual_objective && (
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: tokens.textMuted, lineHeight: 1.4 }}>
            {node.perceptual_objective}
          </p>
        )}
      </div>

      {/* Children */}
      {children.length > 0 && (
        <div style={{ marginLeft: "1.5rem", marginTop: "0.5rem", display: "grid", gap: "0.375rem" }}>
          {children.map(child => (
            <div
              key={child.$id}
              onClick={() => onSelect(child)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") onSelect(child); }}
              style={{
                padding: "0.625rem 0.75rem",
                backgroundColor: tokens.bgHover,
                border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radii?.xs || "2px",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 500, color: tokens.text }}>
                {child.name}
                <span style={{ marginLeft: "0.5rem", fontSize: "0.625rem", color: tokens.textDisabled }}>
                  L{child.level}
                </span>
              </div>
              {child.perceptual_objective && (
                <p style={{ margin: "0.125rem 0 0", fontSize: "0.625rem", color: tokens.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {child.perceptual_objective}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaxonomyDetail({
  entry,
  tokens,
  onClose,
}: {
  entry: AestheticTaxonomy;
  tokens: ReturnType<typeof useTheme>["tokens"];
  onClose: () => void;
}) {
  return (
    <div
      style={{
        marginTop: "1.5rem",
        padding: "1.25rem",
        backgroundColor: tokens.bgHover,
        border: `1px solid ${tokens.accent}`,
        borderRadius: tokens.radii?.lg || "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: tokens.text }}>
          {entry.name}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: `1px solid ${tokens.border}`,
            borderRadius: tokens.radii?.sm || "4px",
            color: tokens.textMuted,
            fontSize: "0.75rem",
            padding: "0.25rem 0.5rem",
            cursor: "pointer",
          }}
          aria-label="Close detail"
        >
          Close
        </button>
      </div>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {entry.perceptual_objective && (
          <DetailField label="Perceptual Objective" value={entry.perceptual_objective} tokens={tokens} />
        )}
        {entry.aesthetic_classification && (
          <DetailField label="Classification" value={entry.aesthetic_classification} tokens={tokens} />
        )}
        {entry.master_prompt_template && (
          <DetailField label="Master Prompt Template" value={entry.master_prompt_template} tokens={tokens} />
        )}
        {entry.external_tags && entry.external_tags.length > 0 && (
          <div>
            <div style={{ fontSize: "0.625rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.textDisabled, marginBottom: "0.375rem" }}>
              Tags
            </div>
            <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
              {entry.external_tags.map(tag => (
                <span key={tag} style={{
                  fontSize: "0.625rem",
                  padding: "0.125rem 0.5rem",
                  borderRadius: "9999px",
                  backgroundColor: `${tokens.accent}20`,
                  color: tokens.accent,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailField({ label, value, tokens }: { label: string; value: string; tokens: ReturnType<typeof useTheme>["tokens"] }) {
  return (
    <div>
      <div style={{ fontSize: "0.625rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.textDisabled, marginBottom: "0.125rem" }}>
        {label}
      </div>
      <div style={{ fontSize: "0.8125rem", color: tokens.text, lineHeight: 1.5 }}>
        {value}
      </div>
    </div>
  );
}
