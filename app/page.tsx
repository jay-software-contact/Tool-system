import React from "react";

export default function HomePage() {
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontFamily: "'Space Grotesk', sans-serif" }}>the-System</h1>
      <p style={{ opacity: 0.7, marginBottom: "2rem", lineHeight: 1.6 }}>
        UI component extraction engine with aesthetic taxonomy, proximity clustering, and adaptation pathways.
        Extract components from live websites, organized by visual aesthetics, with full design token inspection.
      </p>
      <div style={{ display: "grid", gap: "1rem" }}>
        <a href="/catalog" style={{ display: "block", padding: "1rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "inherit", textDecoration: "none" }}>
          <strong style={{ fontFamily: "'Space Grotesk', sans-serif" }}>📦 Component Catalog</strong>
          <p style={{ margin: "0.25rem 0 0", opacity: 0.6, fontSize: "0.875rem" }}>
            Browse extracted components organized by visual aesthetics with detail inspection.
          </p>
        </a>
        <a href="/batch" style={{ display: "block", padding: "1rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "inherit", textDecoration: "none" }}>
          <strong style={{ fontFamily: "'Space Grotesk', sans-serif" }}>⚡ Batch Extraction</strong>
          <p style={{ margin: "0.25rem 0 0", opacity: 0.6, fontSize: "0.875rem" }}>
            Process websites in batches of 100 with progress tracking and failure analysis.
          </p>
        </a>
        <a href="/tools" style={{ display: "block", padding: "1rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "inherit", textDecoration: "none" }}>
          <strong style={{ fontFamily: "'Space Grotesk', sans-serif" }}>🛠 Tools</strong>
          <p style={{ margin: "0.25rem 0 0", opacity: 0.6, fontSize: "0.875rem" }}>
            Manage your tool library with ratings, proximity clusters, and integration mapping.
          </p>
        </a>
        <a href="/taxonomy" style={{ display: "block", padding: "1rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "inherit", textDecoration: "none" }}>
          <strong style={{ fontFamily: "'Space Grotesk', sans-serif" }}>🎨 Aesthetic Taxonomy</strong>
          <p style={{ margin: "0.25rem 0 0", opacity: 0.6, fontSize: "0.875rem" }}>
            Browse the 7 canonical aesthetic classifications with design token criteria.
          </p>
        </a>
      </div>
      <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", fontSize: "0.75rem", opacity: 0.5 }}>
        <strong>Pipeline:</strong> VSCodium → GitHub → Vercel → Appwrite<br/>
        <strong>Batch source:</strong> D:\projects\Websitestools list.txt (2,811 websites)
      </div>
    </div>
  );
}
