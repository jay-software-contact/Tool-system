"use client";

import React, { useState, useCallback, useRef } from "react";
import { useTheme } from "../../components/ui/ThemeContext";
import { ViewShell } from "../../components/layout/ViewShell";
import { Breadcrumb } from "../../components/layout/Breadcrumb";

// ---- Types ----

interface BatchResult {
  url: string;
  status: "pending" | "extracting" | "success" | "failed";
  componentCount?: number;
  error?: string;
  duration?: number;
}

interface BatchStats {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  startedAt?: number;
}

// ---- Sample First 100 Websites ----

const FIRST_100 = [
  "https://coconote.app/", "https://imslp.org/wiki/Main_Page", "https://mindgrasp.ai",
  "https://tracker.okamirufu.com/", "https://www.stills.com/", "https://spline.design",
  "https://unicorn.studio", "https://fuse.kiwi", "https://www.pwc.com/us/en/industries/tmt/library/accounting-financial-reporting-insights.html",
  "https://investors.capgemini.com/en/publication/q1-2026-revenues/", "https://planner5d.com",
  "https://origami.me", "https://peachweb.io", "https://threlte.xyz",
  "https://scholarshipsedge.com/", "https://theatre.js", "https://designspells.com",
  "https://seen.space", "https://handzplay.vercel.app", "https://onesharedhouse2030.com",
  "https://timeduringcovid19.com", "https://www.glassdoor.com/index.htm",
  "https://www.intern-list.com/", "https://jobright.ai/", "https://davesgames.io",
  "https://simulator.electude.com/simulator", "https://github.com/playcanvas/supersplat",
  "https://shantellmartin.art", "https://tinywow.com/", "https://onesharedhouse.com",
  "https://myjotbot.com/", "https://audionetwork.sourceaudio.com/", "https://freeforstudents.org",
  "https://everynoise.com", "https://www.privacy.com/", "https://fakeyou.com",
  "https://docsity.com", "https://oceanofpdf.com", "https://myemulator.online",
  "https://womp3d.com", "https://noclip.website/",
  "https://www.nist.gov/pao/nist-services-products-available-purchase",
  "https://animeowl.live", "https://playretrogames.online", "https://kissasian.com",
  "https://cymath.com", "https://timemap.org", "https://hacksplaning.com",
  "https://www.atlasobscura.com", "https://placestoread.xyz", "https://archive.ph",
  "https://usps.com", "https://tailornova.com", "https://www.ifixit.com",
  "https://codedex.io", "https://create.xyz", "https://topoexport.com",
  "https://www.cosmos.so/", "https://programmablesearchengine.google.com/about/",
  "https://toooools.app", "https://typedither.vercel.app", "https://fontbrief.com",
  "https://makemydrivefun.com", "https://enfont-terrible.com/",
  "https://schultzschultz.com/", "https://moshpro.app/", "https://agentgpt.reworkd.ai",
  "https://jen.com", "https://bao66.com", "https://nala.com.cn",
  "https://go2.cn", "https://vipmro.com", "https://ninite.com",
  "https://startmycar.com", "https://www.designfamilymarket.com/",
  "https://seedsavers.org/", "https://www.shortlist.nyc/", "https://fallingfruit.org",
  "https://musclewiki.com", "https://ethguesser.com", "https://00.myretrotvs.com",
  "https://freeforstudent.org", "https://www.wolfram.com/",
  "https://www.wolframalpha.com/", "https://app.dungeonscrawl.com/",
  "https://chronas.org", "https://tv.garden", "https://onemillionchessboard.com",
  "https://neal.fun", "https://radio.garden", "https://aatiashh.com/patterncollider",
  "https://window-swap.com", "https://costco-next.com", "https://myfridgefood.com",
  "https://playglenn.com", "https://cq.cx", "https://transmission",
];

// ---- Extraction Function ----

type ExtractResult = { status: "success" | "failed"; componentCount: number; error?: string };

async function extractFromUrl(
  url: string,
  onProgress: (status: string) => void,
): Promise<ExtractResult> {
  const start = Date.now();
  
  try {
    onProgress("Navigating to target...");
    
    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(120000),
    });

    if (!res.ok) {
      onProgress(`Error: ${res.status}`);
      return { status: "failed", componentCount: 0, error: `HTTP ${res.status}` };
    }

    if (!res.body) {
      onProgress("Error: empty response");
      return { status: "failed", componentCount: 0, error: "Empty response" };
    }

    onProgress("Streaming extraction...");
    
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let accumulated = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") continue;
        
        try {
          const parsed = JSON.parse(data);
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (delta) accumulated += delta;
        } catch { /* skip non-JSON */ }
      }
    }

    onProgress("Parsing components...");
    
    let components: any[] = [];
    try {
      const parsed = JSON.parse(accumulated);
      if (Array.isArray(parsed)) components = parsed;
    } catch {
      const match = accumulated.match(/\[[\s\S]*\]/);
      if (match) {
        try { components = JSON.parse(match[0]); } catch { /* empty */ }
      }
    }

    const duration = Date.now() - start;
    onProgress(`Done — ${components.length} components`);
    
    return { status: "success", componentCount: components.length };
  } catch (err: any) {
    const duration = Date.now() - start;
    const error = err?.name === "AbortError" ? "Timeout" : (err?.message || "Unknown error");
    onProgress(`Failed: ${error}`);
    return { status: "failed", componentCount: 0, error };
  }
}

// ---- Page Component ----

export default function BatchPage() {
  const { tokens } = useTheme();
  const [results, setResults] = useState<BatchResult[]>(
    FIRST_100.map(url => ({ url, status: "pending" as const }))
  );
  const [stats, setStats] = useState<BatchStats>({ total: FIRST_100.length, processed: 0, succeeded: 0, failed: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const abortRef = useRef(false);

  const runBatch = useCallback(async () => {
    setIsRunning(true);
    abortRef.current = false;
    setStats({ total: FIRST_100.length, processed: 0, succeeded: 0, failed: 0, startedAt: Date.now() });
    setFailedUrls([]);

    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < FIRST_100.length; i++) {
      if (abortRef.current) break;

      const url = FIRST_100[i];
      setCurrentUrl(url);

      setResults(prev => prev.map((r, idx) => 
        idx === i ? { ...r, status: "extracting" } : r
      ));

      const result = await extractFromUrl(url, () => {});

      setResults(prev => prev.map((r, idx) => 
        idx === i ? { ...r, ...result } : r
      ));

      if (result.status === "success") {
        succeeded++;
      } else {
        failed++;
        setFailedUrls(prev => [...prev, url]);
      }

      setStats({
        total: FIRST_100.length,
        processed: i + 1,
        succeeded,
        failed,
        startedAt: stats.startedAt || Date.now(),
      });
    }

    setCurrentUrl(null);
    setIsRunning(false);
  }, [stats.startedAt]);

  const stopBatch = useCallback(() => {
    abortRef.current = true;
  }, []);

  // ---- Render ----

  return (
    <ViewShell>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Batch Extraction" }]} />

      <div style={{ marginTop: "1rem" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: tokens.text }}>
              Batch Extraction
            </h1>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: tokens.textMuted }}>
              Processing {FIRST_100.length} websites in batch · Organized by visual aesthetics
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {!isRunning ? (
              <button
                onClick={runBatch}
                style={{
                  background: tokens.accent,
                  color: tokens.bg,
                  border: "none",
                  borderRadius: tokens.radii?.sm || "4px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                ▶ Start Batch
              </button>
            ) : (
              <button
                onClick={stopBatch}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: tokens.radii?.sm || "4px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                ■ Stop
              </button>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "1.5rem", padding: "12px 16px", backgroundColor: tokens.bgHover, borderRadius: tokens.radii?.sm || "4px" }}>
          <StatBox label="Total" value={stats.total} tokens={tokens} />
          <StatBox label="Processed" value={stats.processed} tokens={tokens} color={tokens.accent} />
          <StatBox label="Succeeded" value={stats.succeeded} tokens={tokens} color="#22c55e" />
          <StatBox label="Failed" value={stats.failed} tokens={tokens} color="#ef4444" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.625rem", color: tokens.textMuted, marginBottom: "4px" }}>Progress</div>
            <div style={{ height: "6px", backgroundColor: tokens.bgActive, borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${stats.total > 0 ? (stats.processed / stats.total) * 100 : 0}%`,
                backgroundColor: tokens.accent,
                borderRadius: "9999px",
                transition: "width 300ms ease",
              }} />
            </div>
          </div>
        </div>

        {/* Current URL */}
        {currentUrl && (
          <div style={{ padding: "8px 12px", backgroundColor: `${tokens.accent}10`, border: `1px solid ${tokens.accent}30`, borderRadius: tokens.radii?.sm || "4px", marginBottom: "1rem", fontSize: "0.6875rem", color: tokens.text, fontFamily: "'JetBrains Mono', monospace" }}>
            → {currentUrl}
          </div>
        )}

        {/* Results Table */}
        <div style={{ display: "grid", gap: "4px" }}>
          {results.map((result, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 12px",
                backgroundColor: result.status === "extracting" ? `${tokens.accent}08` : "transparent",
                borderRadius: tokens.radii?.xs || "2px",
                borderLeft: `3px solid ${
                  result.status === "success" ? "#22c55e" :
                  result.status === "failed" ? "#ef4444" :
                  result.status === "extracting" ? tokens.accent :
                  tokens.border
                }`,
              }}
            >
              <span style={{ fontSize: "0.625rem", color: tokens.textDisabled, minWidth: "24px" }}>
                {idx + 1}
              </span>
              <span style={{
                fontSize: "0.6875rem",
                color: tokens.text,
                fontFamily: "'JetBrains Mono', monospace",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {result.url}
              </span>
              <span style={{
                fontSize: "0.625rem",
                padding: "2px 8px",
                borderRadius: "9999px",
                backgroundColor: 
                  result.status === "success" ? "rgba(34, 197, 94, 0.15)" :
                  result.status === "failed" ? "rgba(239, 68, 68, 0.15)" :
                  result.status === "extracting" ? `${tokens.accent}20` :
                  tokens.bgHover,
                color:
                  result.status === "success" ? "#22c55e" :
                  result.status === "failed" ? "#ef4444" :
                  result.status === "extracting" ? tokens.accent :
                  tokens.textMuted,
                fontWeight: 600,
                minWidth: "80px",
                textAlign: "center",
              }}>
                {result.status === "pending" ? "Pending" :
                 result.status === "extracting" ? "Running..." :
                 result.status === "success" ? `✓ ${result.componentCount}` :
                 `✗ ${result.error || "Failed"}`}
              </span>
            </div>
          ))}
        </div>

        {/* Failed URLs Summary */}
        {failedUrls.length > 0 && !isRunning && (
          <div style={{ marginTop: "2rem", padding: "16px", backgroundColor: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: tokens.radii?.sm || "4px" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "0.8125rem", fontWeight: 600, color: "#ef4444" }}>
              Failed Extractions ({failedUrls.length})
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {failedUrls.map(url => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "0.625rem",
                    color: "#ef4444",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    textDecoration: "none",
                  }}
                >
                  {url.replace(/^https?:\/\//, "")}
                </a>
              ))}
            </div>
            <p style={{ margin: "8px 0 0", fontSize: "0.625rem", color: tokens.textMuted }}>
              These will be analyzed by a retry agent to determine root cause and fix strategy.
            </p>
          </div>
        )}
      </div>
    </ViewShell>
  );
}

function StatBox({ label, value, tokens, color }: { label: string; value: number; tokens: any; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.625rem", color: tokens.textMuted }}>{label}</div>
      <div style={{ fontSize: "1.125rem", fontWeight: 700, color: color || tokens.text, fontFamily: "'Space Grotesk', sans-serif" }}>
        {value}
      </div>
    </div>
  );
}
