import React from "react";

export default function HomePage() {
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>the-System</h1>
      <p style={{ opacity: 0.7, marginBottom: "2rem" }}>
        Tool management platform with aesthetic taxonomy, proximity clustering, and adaptation pathways.
      </p>
      <div style={{ display: "grid", gap: "1rem" }}>
        <a href="/catalog" style={{ display: "block", padding: "1rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "inherit", textDecoration: "none" }}>
          <strong>Catalog</strong>
          <p style={{ margin: "0.25rem 0 0", opacity: 0.6, fontSize: "0.875rem" }}>
            Browse extracted components organized by visual aesthetics.
          </p>
        </a>
        <a href="/batch" style={{ display: "block", padding: "1rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "inherit", textDecoration: "none" }}>
          <strong>Batch Extract</strong>
          <p style={{ margin: "0.25rem 0 0", opacity: 0.6, fontSize: "0.875rem" }}>
            Process websites in batches of 100 with failure tracking.
          </p>
        </a>
      </div>
    </div>
  );
}
