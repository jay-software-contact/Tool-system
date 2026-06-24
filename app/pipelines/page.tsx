"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "../../components/ui/ThemeContext";
import { ViewShell } from "../../components/layout/ViewShell";
import { PipelineListView } from "../../components/views/PipelineListView";
import { fetchPipelines } from "../../lib/data";
import type { PipelineDomain } from "../../lib/appwrite";

export default function PipelinesPage() {
  const { tokens } = useTheme();
  const [pipelines, setPipelines] = useState<PipelineDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    async function loadPipelines() {
      // Placeholder: In production, fetch from Appwrite
      // For now, show empty state with instructions
      const data = await fetchPipelines();
      setPipelines(data);
      setLoading(false);
    }
    loadPipelines();
  }, []);

  const handleSelect = (pipeline: any) => {
    setSelectedId(pipeline.id || pipeline.$id);
  };

  const handleEdit = (pipeline: any) => {
    console.log("Edit pipeline:", pipeline.name);
  };

  const handleDelete = (pipeline: any) => {
    console.log("Delete pipeline:", pipeline.name);
  };

  const handleDuplicate = (pipeline: any) => {
    console.log("Duplicate pipeline:", pipeline.name);
  };

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
              Pipelines
            </h1>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: tokens.textMuted }}>
              Multi-step tool chains with visual editing
            </p>
          </div>
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

        {/* Pipeline list */}
        <PipelineListView
          pipelines={pipelines}
          loading={loading}
          selectedId={selectedId}
          filterText={filterText}
          onSelect={handleSelect}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onFilterTextChange={setFilterText}
        />
      </div>
    </ViewShell>
  );
}
