/**
 * Tool Engine — The Core Extraction & Adaptation System
 * 
 * This is the reason the project exists. The Tool Engine:
 * 1. Extracts component information from various sources (screenshots, code, descriptions)
 * 2. Classifies tools into domains, categories, and aesthetic taxonomies
 * 3. Computes proximity clusters (what tools are "near" each other in feature space)
 * 4. Generates adaptation pathways — how to transform a tool from one context to another
 * 5. Produces structured, reusable output for downstream projects
 * 
 * The engine is framework-agnostic and storage-agnostic. It operates on
 * typed inputs and produces typed outputs. Appwrite is just the persistence
 * layer; the engine itself is pure logic.
 */

import type { Tool, PipelineDomain, AestheticTaxonomy } from "./appwrite";

interface PipelineStep {
  id: string;
  label: string;
  order: number;
  tools: Array<{ id: string; name: string; role: string; icon?: string; filled: boolean }>;
  valid: boolean;
}

// ---- Types ----

export interface ExtractedComponent {
  /** Unique identifier for this extraction */
  id: string;
  /** Source tool or platform name */
  sourceName: string;
  /** What the component does (functional description) */
  function: string;
  /** Component type classification */
  type: ComponentType;
  /** Domain it belongs to */
  domain: string;
  /** Sub-category within the domain */
  subcategory?: string;
  /** Visual/aesthetic properties extracted */
  aesthetic: AestheticProfile;
  /** Structural properties */
  structure: StructureProfile;
  /** Behavioral properties */
  behavior: BehaviorProfile;
  /** Adaptation potential — how well can this be repurposed? */
  adaptability: AdaptabilityScore;
  /** Related components (IDs of similar components) */
  relatedIds: string[];
  /** Tags for cross-referencing */
  tags: string[];
  /** Timestamp of extraction */
  extractedAt: number;
}

export type ComponentType =
  | "input"
  | "output"
  | "transform"
  | "display"
  | "navigation"
  | "feedback"
  | "layout"
  | "logic"
  | "data"
  | "media";

export interface AestheticProfile {
  /** Visual density (0-1): how much information per viewport */
  density: number;
  /** Chromatic mode: light, dark, mixed */
  chromaticMode: "light" | "dark" | "mixed";
  /** Primary interaction style */
  interactionStyle: "click" | "swipe" | "type" | "voice" | "scroll";
  /** Animation intensity (0-1) */
  motionIntensity: number;
  /** Typography dominance (0-1) */
  typographyProminence: number;
  /** Classification against known aesthetic taxonomies */
  aestheticTags: string[];
}

export interface StructureProfile {
  /** Number of distinct UI regions */
  regionCount: number;
  /** Has header: boolean */
  hasHeader: boolean;
  /** Has sidebar: boolean */
  hasSidebar: boolean;
  /** Has footer: boolean */
  hasFooter: boolean;
  /** Layout pattern */
  pattern: "single-column" | "multi-column" | "grid" | "split" | "overlay";
  /** Responsive behavior */
  responsive: boolean;
}

export interface BehaviorProfile {
  /** Data flow direction */
  dataFlow: "unidirectional" | "bidirectional" | "event-driven";
  /** State complexity (0-1) */
  stateComplexity: number;
  /** Real-time capability: boolean */
  realtime: boolean;
  /** Offline capability: boolean */
  offlineCapable: boolean;
  /** Authentication required: boolean */
  requiresAuth: boolean;
}

export interface AdaptabilityScore {
  /** Overall adaptability (0-1) */
  overall: number;
  /** How reusable is the component logic? */
  logicReusability: number;
  /** How reusable are the visual patterns? */
  visualReusability: number;
  /** How well does it integrate with other systems? */
  integrationCompatibility: number;
  /** Required effort to adapt (1=low, 5=high) */
  adaptationEffort: number;
}

export interface ProximityCluster {
  /** Cluster identifier */
  id: string;
  /** Human-readable cluster name */
  name: string;
  /** Components in this cluster */
  componentIds: string[];
  /** Centroid characteristics */
  centroid: {
    domain: string;
    type: ComponentType;
    aestheticDensity: number;
  };
  /** Average distance between cluster members */
  cohesion: number;
}

export interface AdaptationPathway {
  /** Source component ID */
  fromId: string;
  /** Target domain/context */
  toDomain: string;
  /** Steps to transform */
  steps: AdaptationStep[];
  /** Estimated effort */
  effort: number;
  /** Resulting component type */
  resultType: ComponentType;
}

export interface AdaptationStep {
  /** What to change */
  action: "restructure" | "restyle" | "reconnect" | "extend" | "simplify";
  /** What part of the component */
  target: string;
  /** Description of the change */
  description: string;
  /** Difficulty (1-5) */
  difficulty: number;
}

// ---- Extraction Engine ----

export class ToolEngine {
  private components: Map<string, ExtractedComponent> = new Map();
  private clusters: ProximityCluster[] = [];
  private taxonomies: Map<string, AestheticTaxonomy> = new Map();

  /**
   * Register a component for extraction and analysis.
   * The engine will classify it, compute its profile, and assign it to a cluster.
   */
  register(tool: Tool): ExtractedComponent {
    const extracted: ExtractedComponent = {
      id: tool.$id || crypto.randomUUID(),
      sourceName: tool.name,
      function: tool.description || tool.name,
      type: this.classifyType(tool),
      domain: tool.domain,
      subcategory: tool.subcategory || undefined,
      aesthetic: this.extractAesthetic(tool),
      structure: this.extractStructure(tool),
      behavior: this.extractBehavior(tool),
      adaptability: this.computeAdaptability(tool),
      relatedIds: tool.proximityNeighbors || [],
      tags: tool.tags || [],
      extractedAt: Date.now(),
    };

    this.components.set(extracted.id, extracted);
    return extracted;
  }

  /**
   * Batch register multiple tools.
   */
  registerBatch(tools: Tool[]): ExtractedComponent[] {
    return tools.map(tool => this.register(tool));
  }

  /**
   * Compute proximity clusters from registered components.
   * Uses simple domain + type + aesthetic similarity for grouping.
   */
  computeClusters(): ProximityCluster[] {
    const groups: Record<string, ExtractedComponent[]> = {};

    for (const comp of this.components.values()) {
      const key = `${comp.domain}::${comp.type}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(comp);
    }

    this.clusters = Object.entries(groups).map(([key, comps], idx) => {
      const [domain, type] = key.split("::");
      const avgDensity = comps.reduce((s, c) => s + c.aesthetic.density, 0) / comps.length;

      return {
        id: `cluster-${idx}`,
        name: `${domain} / ${type}`,
        componentIds: comps.map(c => c.id),
        centroid: { domain, type: type as ComponentType, aestheticDensity: avgDensity },
        cohesion: this.computeCohesion(comps),
      };
    });

    return this.clusters;
  }

  /**
   * Generate adaptation pathways for a component.
   * Shows how to transform it for use in a different domain.
   */
  generateAdaptationPathways(componentId: string, targetDomain: string): AdaptationPathway[] {
    const comp = this.components.get(componentId);
    if (!comp) return [];

    const pathways: AdaptationPathway[] = [];

    // Find components in the target domain
    const targetComps = Array.from(this.components.entries()).map(([, v]) => v)
      .filter(c => c.domain === targetDomain && c.id !== componentId);

    for (const target of targetComps.slice(0, 3)) {
      const steps: AdaptationStep[] = [];

      if (comp.structure.pattern !== target.structure.pattern) {
        steps.push({
          action: "restructure",
          target: "layout",
          description: `Convert from ${comp.structure.pattern} to ${target.structure.pattern} layout`,
          difficulty: 3,
        });
      }

      if (comp.aesthetic.chromaticMode !== target.aesthetic.chromaticMode) {
        steps.push({
          action: "restyle",
          target: "color-scheme",
          description: `Adapt from ${comp.aesthetic.chromaticMode} to ${target.aesthetic.chromaticMode} color scheme`,
          difficulty: 2,
        });
      }

      if (comp.type !== target.type) {
        steps.push({
          action: "reconnect",
          target: "data-flow",
          description: `Redirect data flow from ${comp.type} to ${target.type} pattern`,
          difficulty: 4,
        });
      }

      if (comp.behavior.stateComplexity < target.behavior.stateComplexity) {
        steps.push({
          action: "extend",
          target: "state-management",
          description: `Add state handling for increased complexity (${comp.behavior.stateComplexity} → ${target.behavior.stateComplexity})`,
          difficulty: 3,
        });
      }

      if (comp.behavior.stateComplexity > target.behavior.stateComplexity) {
        steps.push({
          action: "simplify",
          target: "state-management",
          description: `Reduce state complexity from ${comp.behavior.stateComplexity} to ${target.behavior.stateComplexity}`,
          difficulty: 2,
        });
      }

      pathways.push({
        fromId: componentId,
        toDomain: targetDomain,
        steps,
        effort: steps.reduce((s, step) => s + step.difficulty, 0),
        resultType: target.type,
      });
    }

    return pathways;
  }

  /**
   * Export components in a format usable by other projects.
   * Strips Appwrite-specific fields, keeps only the extracted intelligence.
   */
  exportForProject(projectType: "components" | "patterns" | "full" = "full"): Record<string, unknown> {
    const output: Record<string, unknown> = {
      exportedAt: Date.now(),
      projectType,
      componentCount: this.components.size,
      clusterCount: this.clusters.length,
    };

    if (projectType === "components" || projectType === "full") {
      output.components = Array.from(this.components.entries()).map(([, v]) => v).map(c => ({
        id: c.id,
        sourceName: c.sourceName,
        function: c.function,
        type: c.type,
        domain: c.domain,
        aesthetic: c.aesthetic,
        structure: c.structure,
        behavior: c.behavior,
        adaptability: c.adaptability,
        tags: c.tags,
      }));
    }

    if (projectType === "patterns" || projectType === "full") {
      output.clusters = this.clusters;
      output.patterns = this.extractPatterns();
    }

    return output;
  }

  // ---- Private Classification Methods ----

  private classifyType(tool: Tool): ComponentType {
    const desc = (tool.description || "").toLowerCase();
    const name = tool.name.toLowerCase();
    const category = (tool.category || "").toLowerCase();

    if (desc.includes("input") || name.includes("input") || category === "forms") return "input";
    if (desc.includes("output") || name.includes("output") || category === "display") return "output";
    if (desc.includes("transform") || name.includes("convert") || category === "data") return "transform";
    if (desc.includes("display") || name.includes("show") || category === "display") return "display";
    if (desc.includes("nav") || name.includes("menu") || category === "navigation") return "navigation";
    if (desc.includes("feedback") || name.includes("alert") || category === "feedback") return "feedback";
    if (desc.includes("layout") || name.includes("container") || category === "layout") return "layout";
    if (desc.includes("logic") || name.includes("rule") || category === "logic") return "logic";
    if (desc.includes("data") || name.includes("database") || category === "data") return "data";
    if (desc.includes("media") || name.includes("image") || category === "media") return "media";

    return "display"; // default
  }

  private extractAesthetic(tool: Tool): AestheticProfile {
    const tags = tool.tags || [];
    const aestheticTags = tool.aestheticTags || [];

    return {
      density: this.scoreDensity(tool),
      chromaticMode: tags.includes("light") ? "light" : tags.includes("dark") ? "dark" : "dark",
      interactionStyle: tags.includes("touch") ? "swipe" : tags.includes("voice") ? "voice" : "click",
      motionIntensity: tags.includes("animated") ? 0.7 : tags.includes("static") ? 0.1 : 0.3,
      typographyProminence: tags.includes("text-heavy") ? 0.8 : tags.includes("minimal") ? 0.2 : 0.5,
      aestheticTags: aestheticTags.length > 0 ? aestheticTags : ["unclassified"],
    };
  }

  private extractStructure(tool: Tool): StructureProfile {
    const desc = (tool.description || "").toLowerCase();

    return {
      regionCount: desc.split(/[,;]/).length,
      hasHeader: desc.includes("header") || desc.includes("top bar"),
      hasSidebar: desc.includes("sidebar") || desc.includes("side panel"),
      hasFooter: desc.includes("footer") || desc.includes("bottom bar"),
      pattern: desc.includes("grid") ? "grid" : desc.includes("split") ? "split" : desc.includes("overlay") ? "overlay" : desc.includes("multi") ? "multi-column" : "single-column",
      responsive: !desc.includes("fixed") && !desc.includes("desktop-only"),
    };
  }

  private extractBehavior(tool: Tool): BehaviorProfile {
    const desc = (tool.description || "").toLowerCase();

    return {
      dataFlow: desc.includes("realtime") ? "event-driven" : desc.includes("two-way") ? "bidirectional" : "unidirectional",
      stateComplexity: desc.includes("complex") ? 0.8 : desc.includes("simple") ? 0.2 : 0.5,
      realtime: desc.includes("realtime") || desc.includes("live"),
      offlineCapable: desc.includes("offline") || desc.includes("pwa"),
      requiresAuth: desc.includes("auth") || desc.includes("login") || desc.includes("private"),
    };
  }

  private computeAdaptability(tool: Tool): AdaptabilityScore {
    const tags = tool.tags || [];
    const hasCode = !!tool.repoUrl;
    const hasDocs = !!tool.docsUrl;
    const hasIntegrations = (tool.integrationIds?.length || 0) > 0;

    const logicReusability = hasCode ? 0.8 : hasDocs ? 0.5 : 0.3;
    const visualReusability = tags.includes("themed") ? 0.9 : tags.includes("styled") ? 0.6 : 0.4;
    const integrationCompatibility = hasIntegrations ? 0.8 : 0.4;

    const overall = (logicReusability + visualReusability + integrationCompatibility) / 3;
    const adaptationEffort = Math.max(1, Math.min(5, Math.round(5 - overall * 4)));

    return { overall, logicReusability, visualReusability, integrationCompatibility, adaptationEffort };
  }

  private scoreDensity(tool: Tool): number {
    const desc = (tool.description || "").toLowerCase();
    if (desc.includes("dense") || desc.includes("information")) return 0.8;
    if (desc.includes("minimal") || desc.includes("clean")) return 0.2;
    return 0.5;
  }

  private computeCohesion(comps: ExtractedComponent[]): number {
    if (comps.length < 2) return 1;
    const types = new Set(comps.map(c => c.type));
    const domains = new Set(comps.map(c => c.domain));
    return (1 / types.size) * (1 / domains.size);
  }

  private extractPatterns(): Array<{ name: string; description: string; componentCount: number }> {
    const patterns: Record<string, { count: number; domains: Set<string> }> = {};

    for (const comp of this.components.values()) {
      const key = `${comp.structure.pattern}`;
      if (!patterns[key]) patterns[key] = { count: 0, domains: new Set() };
      patterns[key].count++;
      patterns[key].domains.add(comp.domain);
    }

    return Object.entries(patterns).map(([name, info]) => ({
      name,
      description: `Found in ${info.count} components across ${info.domains.size} domains`,
      componentCount: info.count,
    }));
  }

  // ---- Accessors ----

  getComponent(id: string): ExtractedComponent | undefined {
    return this.components.get(id);
  }

  getAllComponents(): ExtractedComponent[] {
    return Array.from(this.components.entries()).map(([, v]) => v);
  }

  getClusters(): ProximityCluster[] {
    return this.clusters;
  }
}

export default ToolEngine;
