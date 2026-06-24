"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../components/ui/ThemeContext";
import { ViewShell } from "../../components/layout/ViewShell";
import { Breadcrumb } from "../../components/layout/Breadcrumb";

// ---- Types ----

interface ExtractedComponent {
  id: string;
  name: string;
  description: string;
  aestheticCategory: string;
  type: string;
  function: string;
  designTokens: Record<string, string>;
  sourceUrl?: string;
  createdAt: string;
}

type ViewMode = "aesthetic" | "function" | "type";

const SEVEN_AESTHETICS = [
  { name: "Metal Heart", color: "#6B7280", description: "Industrial, raw, exposed surface" },
  { name: "GXSC", color: "#C4714A", description: "Styled but structured baseline" },
  { name: "Grunge", color: "#92400E", description: "Textured, degraded, anti-polished" },
  { name: "Minimalist", color: "#9AA0A6", description: "Maximum reduction, typographic hierarchy" },
  { name: "Corporate", color: "#2563EB", description: "Professional, trust-signaling" },
  { name: "Futuristic", color: "#7C3AED", description: "Tech-forward, dark-native, gradient-heavy" },
  { name: "Playful", color: "#F59E0B", description: "Bright, rounded, friendly" },
];

const CANONICAL_FUNCTIONS = [
  "Conversion", "Navigation", "Information", "Input", "Display", "Social-Proof", "Feedback",
];

// ---- Mock Data (will be replaced with API data) ----

const MOCK_COMPONENTS: ExtractedComponent[] = [
  { id: "1", name: "PrimaryButton", description: "Rounded rectangular CTA with gradient background", aestheticCategory: "Futuristic", type: "Button", function: "Conversion", designTokens: { backgroundColor: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#ffffff", borderRadius: "12px", padding: "12px 32px", fontSize: "16px", fontFamily: "Inter, sans-serif" }, createdAt: new Date().toISOString() },
  { id: "2", name: "FeatureCard", description: "Clean white card with subtle shadow and icon", aestheticCategory: "GXSC", type: "Card", function: "Information", designTokens: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", fontFamily: "Inter, sans-serif" }, createdAt: new Date().toISOString() },
  { id: "3", name: "NavSidebar", description: "Dark sidebar with icon navigation and collapsed state", aestheticCategory: "Metal Heart", type: "Sidebar", function: "Navigation", designTokens: { backgroundColor: "#1a1a2e", color: "#e0e0e0", width: "220px", borderRight: "1px solid #2a2a3e", fontFamily: "DM Sans, sans-serif" }, createdAt: new Date().toISOString() },
  { id: "4", name: "HeroSection", description: "Full-width hero with gradient background and centered headline", aestheticCategory: "Futuristic", type: "Hero", function: "Conversion", designTokens: { backgroundColor: "linear-gradient(135deg, #0A0A0F, #1a1a2e)", color: "#ffffff", padding: "80px 40px", borderRadius: "0px", fontFamily: "Space Grotesk, sans-serif" }, createdAt: new Date().toISOString() },
  { id: "5", name: "InputField", description: "Minimal input with floating label and focus ring", aestheticCategory: "Minimalist", type: "Input", function: "Input", designTokens: { backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "12px 16px", fontSize: "14px", fontFamily: "Inter, sans-serif" }, createdAt: new Date().toISOString() },
  { id: "6", name: "PricingTable", description: "Three-tier pricing with highlighted recommended plan", aestheticCategory: "Corporate", type: "Pricing-Table", function: "Conversion", designTokens: { backgroundColor: "#F8FAFC", borderRadius: "8px", padding: "32px", borderColor: "#0066FF", fontFamily: "Inter, sans-serif" }, createdAt: new Date().toISOString() },
  { id: "7", name: "TestimonialCard", description: "User quote with avatar and star rating", aestheticCategory: "Playful", type: "Testimonial", function: "Social-Proof", designTokens: { backgroundColor: "#FFFBEB", borderRadius: "20px", padding: "24px", color: "#92400E", fontFamily: "DM Sans, sans-serif" }, createdAt: new Date().toISOString() },
  { id: "8", name: "StatCard", description: "Large number display with label and trend indicator", aestheticCategory: "GXSC", type: "Stat-Card", function: "Information", designTokens: { backgroundColor: "#1E1E1E", color: "#FFFFFF", borderRadius: "12px", padding: "20px", fontFamily: "Space Grotesk, sans-serif" }, createdAt: new Date().toISOString() },
  { id: "9", name: "DropdownMenu", description: "Floating menu with hover states and dividers", aestheticCategory: "Minimalist", type: "Dropdown", function: "Navigation", designTokens: { backgroundColor: "#FFFFFF", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", padding: "8px 0", fontFamily: "Inter, sans-serif" }, createdAt: new Date().toISOString() },
  { id: "10", name: "ProgressBar", description: "Animated progress bar with percentage label", aestheticCategory: "Futuristic", type: "Progress-Bar", function: "Feedback", designTokens: { backgroundColor: "#7C3AED", height: "8px", borderRadius: "9999px", fontFamily: "Inter, sans-serif" }, createdAt: new Date().toISOString() },
  { id: "11", name: "BadgeTag", description: "Small pill-shaped badge with accent color", aestheticCategory: "Playful", type: "Badge", function: "Information", designTokens: { backgroundColor: "#F59E0B20", color: "#F59E0B", borderRadius: "9999px", padding: "4px 12px", fontSize: "12px", fontFamily: "DM Sans, sans-serif" }, createdAt: new Date().toISOString() },
  { id: "12", name: "BreadcrumbNav", description: "Chevron-separated navigation trail", aestheticCategory: "Corporate", type: "Breadcrumb", function: "Navigation", designTokens: { color: "#6B7280", fontSize: "14px", gap: "8px", fontFamily: "Inter, sans-serif" }, createdAt: new Date().toISOString() },
];

// ---- Component Card ----

function ComponentCard({ component, onSelect }: { component: ExtractedComponent; onSelect: (c: ExtractedComponent) => void }) {
  const { tokens } = useTheme();
  const aestheticMeta = SEVEN_AESTHETICS.find(a => a.name === component.aestheticCategory);

  // Render design tokens as a mini preview
  const previewStyle: React.CSSProperties = {
    backgroundColor: component.designTokens.backgroundColor || tokens.bgHover,
    color: component.designTokens.color || tokens.text,
    borderRadius: component.designTokens.borderRadius || tokens.radii?.md || "6px",
    padding: component.designTokens.padding || "12px",
    fontSize: component.designTokens.fontSize || "12px",
    fontFamily: component.designTokens.fontFamily || "inherit",
    border: component.designTokens.border || "none",
    boxShadow: component.designTokens.boxShadow || "none",
    minHeight: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  return (
    <div
      onClick={() => onSelect(component)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onSelect(component); }}
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
          {component.designTokens.backgroundColor && (
            <div style={{ width: "40px", height: "24px", borderRadius: "4px", background: component.designTokens.backgroundColor }} />
          )}
          <span style={{ marginLeft: "8px", fontSize: "11px", color: component.designTokens.color || tokens.text }}>
            {component.name}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "8px 12px" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: tokens.text, fontFamily: "'Space Grotesk', sans-serif" }}>
          {component.name}
        </div>
        <div style={{ display: "flex", gap: "4px", marginTop: "4px", flexWrap: "wrap" }}>
          <span style={{
            fontSize: "0.6rem",
            padding: "2px 6px",
            borderRadius: "9999px",
            backgroundColor: `${aestheticMeta?.color || tokens.accent}20`,
            color: aestheticMeta?.color || tokens.accent,
          }}>
            {component.aestheticCategory}
          </span>
          <span style={{
            fontSize: "0.6rem",
            padding: "2px 6px",
            borderRadius: "9999px",
            backgroundColor: `${tokens.textMuted}20`,
            color: tokens.textMuted,
          }}>
            {component.type}
          </span>
          <span style={{
            fontSize: "0.6rem",
            padding: "2px 6px",
            borderRadius: "9999px",
            backgroundColor: `${tokens.accent}15`,
            color: tokens.accent,
          }}>
            {component.function}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- Detail Panel ----

function DetailPanel({ component, onClose }: { component: ExtractedComponent; onClose: () => void }) {
  const { tokens } = useTheme();
  const aestheticMeta = SEVEN_AESTHETICS.find(a => a.name === component.aestheticCategory);

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
          {component.name}
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
          {component.aestheticCategory}
        </span>
        <span style={{ fontSize: "0.65rem", padding: "3px 8px", borderRadius: "9999px", backgroundColor: `${tokens.textMuted}20`, color: tokens.textMuted }}>
          {component.type}
        </span>
        <span style={{ fontSize: "0.65rem", padding: "3px 8px", borderRadius: "9999px", backgroundColor: `${tokens.accent}15`, color: tokens.accent }}>
          {component.function}
        </span>
      </div>

      {/* Description */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.textDisabled, marginBottom: "4px" }}>
          Description
        </div>
        <p style={{ fontSize: "0.8125rem", color: tokens.text, lineHeight: 1.5, margin: 0 }}>
          {component.description}
        </p>
      </div>

      {/* Design Tokens */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.textDisabled, marginBottom: "8px" }}>
          Design Tokens
        </div>
        <div style={{ display: "grid", gap: "4px" }}>
          {Object.entries(component.designTokens).map(([key, value]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px", backgroundColor: tokens.bgHover, borderRadius: tokens.radii?.sm || "4px" }}>
              {key === "backgroundColor" && (
                <div style={{ width: "16px", height: "16px", borderRadius: "3px", backgroundColor: value, border: `1px solid ${tokens.border}`, flexShrink: 0 }} />
              )}
              <span style={{ fontSize: "0.65rem", color: tokens.textMuted, fontFamily: "'JetBrains Mono', monospace", minWidth: "100px" }}>
                {key}
              </span>
              <span style={{ fontSize: "0.65rem", color: tokens.text, fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {value || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Source */}
      {component.sourceUrl && (
        <div>
          <div style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.textDisabled, marginBottom: "4px" }}>
            Source
          </div>
          <a
            href={component.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.75rem", color: tokens.accent, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}
          >
            {component.sourceUrl}
          </a>
        </div>
      )}
    </div>
  );
}

// ---- Main Page ----

export default function CatalogPage() {
  const { tokens } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>("aesthetic");
  const [selectedAesthetic, setSelectedAesthetic] = useState<string | null>(null);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<ExtractedComponent | null>(null);
  const [components, setComponents] = useState<ExtractedComponent[]>(MOCK_COMPONENTS);

  // Group by current view mode
  const grouped = useMemo(() => {
    const groups: Record<string, ExtractedComponent[]> = {};
    
    for (const comp of components) {
      let key: string;
      if (viewMode === "aesthetic") {
        key = comp.aestheticCategory;
      } else if (viewMode === "function") {
        key = comp.function;
      } else {
        key = comp.type;
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(comp);
    }
    
    return groups;
  }, [components, viewMode]);

  const filteredComponents = useMemo(() => {
    let filtered = components;
    if (selectedAesthetic && viewMode === "aesthetic") {
      filtered = filtered.filter(c => c.aestheticCategory === selectedAesthetic);
    }
    if (selectedFunction && viewMode === "function") {
      filtered = filtered.filter(c => c.function === selectedFunction);
    }
    return filtered;
  }, [components, selectedAesthetic, selectedFunction, viewMode]);

  const displayGrouped = useMemo(() => {
    if (selectedAesthetic || selectedFunction) {
      const groups: Record<string, ExtractedComponent[]> = { "Results": filteredComponents };
      return groups;
    }
    return grouped;
  }, [filteredComponents, grouped, selectedAesthetic, selectedFunction]);

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
              {components.length} components · Organized by {viewMode}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: "flex", gap: "4px", backgroundColor: tokens.bgHover, borderRadius: tokens.radii?.sm || "4px", padding: "3px" }}>
            {(["aesthetic", "function", "type"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => { setViewMode(mode); setSelectedAesthetic(null); setSelectedFunction(null); }}
                style={{
                  background: viewMode === mode ? tokens.accent : "transparent",
                  color: viewMode === mode ? tokens.bg : tokens.textMuted,
                  border: "none",
                  borderRadius: tokens.radii?.xs || "2px",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  padding: "6px 12px",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 150ms ease",
                }}
              >
                {mode === "aesthetic" ? "🎨 Aesthetic" : mode === "function" ? "⚡ Function" : "📦 Type"}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        {viewMode === "aesthetic" && (
          <div style={{ display: "flex", gap: "6px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {SEVEN_AESTHETICS.map((a) => (
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
                {a.name} ({components.filter(c => c.aestheticCategory === a.name).length})
              </button>
            ))}
          </div>
        )}

        {viewMode === "function" && (
          <div style={{ display: "flex", gap: "6px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {CANONICAL_FUNCTIONS.map((fn) => (
              <button
                key={fn}
                onClick={() => setSelectedFunction(selectedFunction === fn ? null : fn)}
                style={{
                  background: selectedFunction === fn ? `${tokens.accent}30` : tokens.bgHover,
                  color: selectedFunction === fn ? tokens.accent : tokens.textMuted,
                  border: `1px solid ${selectedFunction === fn ? tokens.accent : tokens.border}`,
                  borderRadius: "9999px",
                  fontSize: "0.6875rem",
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {fn} ({components.filter(c => c.function === fn).length})
              </button>
            ))}
          </div>
        )}

        {/* Groups */}
        <div style={{ display: "grid", gap: "2rem" }}>
          {Object.entries(displayGrouped)
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
                  {items.map((comp) => (
                    <ComponentCard key={comp.id} component={comp} onSelect={setSelectedComponent} />
                  ))}
                </div>
              </div>
            ))}
        </div>

        {Object.keys(displayGrouped).length === 0 && (
          <div style={{ padding: "3rem", textAlign: "center", color: tokens.textMuted, fontSize: "0.8125rem" }}>
            No components match your filters. Run extractions to populate the catalog.
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedComponent && (
        <DetailPanel component={selectedComponent} onClose={() => setSelectedComponent(null)} />
      )}
    </ViewShell>
  );
}
