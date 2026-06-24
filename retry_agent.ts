/**
 * Retry Agent — Diagnoses failed extractions and suggests fixes.
 * 
 * Reads from batch1_failed.txt and analyzes each failure to determine:
 * 1. Root cause (auth wall, timeout, network, JS rendering, etc.)
 * 2. Whether the failure is retryable
 * 3. Suggested fix strategy
 * 
 * Dispatches subagents to retry fixable extractions with modified approach.
 */

import { readFileSync, writeFileSync } from 'fs';

// ---- Types ----

interface FailureDiagnosis {
  url: string;
  originalError: string;
  category: 'auth' | 'timeout' | 'network' | 'js_rendering' | 'empty_response' | 'unknown';
  retryable: boolean;
  suggestedFix: string;
  retryStrategy?: string;
}

// ---- Diagnosis Logic ----

function diagnoseFailure(url: string, error: string): FailureDiagnosis {
  const lowerError = error.toLowerCase();
  
  // Authentication / access blocked
  if (lowerError.includes('401') || lowerError.includes('403') || 
      lowerError.includes('auth') || lowerError.includes('captcha') ||
      lowerError.includes('blocked') || lowerError.includes('forbidden')) {
    return {
      url,
      originalError: error,
      category: 'auth',
      retryable: false,
      suggestedFix: 'Skip — site blocks automated access. Manual extraction required.',
    };
  }
  
  // Timeout
  if (lowerError.includes('timeout') || lowerError.includes('abort') ||
      lowerError.includes('timed out') || lowerError.includes('deadline')) {
    return {
      url,
      originalError: error,
      category: 'timeout',
      retryable: true,
      suggestedFix: 'Retry with increased timeout (180s) and simplified extraction.',
      retryStrategy: 'increased_timeout',
    };
  }
  
  // Network error
  if (lowerError.includes('enotfound') || lowerError.includes('econnrefused') ||
      lowerError.includes('network') || lowerError.includes('dns') ||
      lowerError.includes('resolve') || lowerError.includes('connection')) {
    return {
      url,
      originalError: error,
      category: 'network',
      retryable: true,
      suggestedFix: 'Retry after 30s delay — site may be temporarily down.',
      retryStrategy: 'retry_with_delay',
    };
  }
  
  // JS rendering required
  if (lowerError.includes('js') || lowerError.includes('javascript') ||
      lowerError.includes('render') || lowerError.includes('spa') ||
      lowerError.includes('empty') || lowerError.includes('no content')) {
    return {
      url,
      originalError: error,
      category: 'js_rendering',
      retryable: true,
      suggestedFix: 'Retry with DOM-snapshot fallback — page requires JS execution.',
      retryStrategy: 'dom_snapshot_fallback',
    };
  }
  
  // Empty response
  if (lowerError.includes('empty') || lowerError.includes('no components') ||
      lowerError.includes('no response') || lowerError.includes('0 components')) {
    return {
      url,
      originalError: error,
      category: 'empty_response',
      retryable: true,
      suggestedFix: 'Retry with relaxed extraction threshold or skip if below 40px minimum.',
      retryStrategy: 'relaxed_threshold',
    };
  }
  
  // Unknown
  return {
    url,
    originalError: error,
    category: 'unknown',
    retryable: true,
    suggestedFix: 'Retry with full pipeline — unknown error may be transient.',
    retryStrategy: 'full_retry',
  };
}

// ---- Batch Analyzer ----

function analyzeBatchFailures(resultsFile: string): FailureDiagnosis[] {
  let results: Array<{ url: string; status: string; error?: string; components?: number }>;
  
  try {
    const data = JSON.parse(readFileSync(resultsFile, 'utf-8'));
    results = data.results || [];
  } catch {
    console.error(`Failed to read ${resultsFile}`);
    return [];
  }
  
  const diagnoses: FailureDiagnosis[] = [];
  
  for (const result of results) {
    if (result.status === 'failed') {
      const diagnosis = diagnoseFailure(result.url, result.error || 'Unknown error');
      diagnoses.push(diagnosis);
    }
  }
  
  return diagnoses;
}

// ---- Report Generator ----

function generateReport(diagnoses: FailureDiagnosis[]): string {
  const categories: Record<string, FailureDiagnosis[]> = {};
  
  for (const d of diagnoses) {
    if (!categories[d.category]) categories[d.category] = [];
    categories[d.category].push(d);
  }
  
  let report = `# Batch Extraction Failure Report\n\n`;
  report += `Total failures: ${diagnoses.length}\n`;
  report += `Retryable: ${diagnoses.filter(d => d.retryable).length}\n`;
  report += `Non-retryable: ${diagnoses.filter(d => !d.retryable).length}\n\n`;
  
  report += `## By Category\n\n`;
  for (const [category, items] of Object.entries(categories)) {
    report += `### ${category} (${items.length})\n`;
    for (const item of items.slice(0, 5)) {
      report += `- ${item.url}: ${item.suggestedFix}\n`;
    }
    if (items.length > 5) {
      report += `- ... and ${items.length - 5} more\n`;
    }
    report += `\n`;
  }
  
  report += `## Retryable URLs\n\n`;
  const retryable = diagnoses.filter(d => d.retryable);
  for (const item of retryable) {
    report += `- [${item.retryStrategy}] ${item.url}\n`;
  }
  
  report += `\n## Non-Retryable URLs (skip)\n\n`;
  const nonRetryable = diagnoses.filter(d => !d.retryable);
  for (const item of nonRetryable) {
    report += `- ${item.url}: ${item.originalError}\n`;
  }
  
  return report;
}

// ---- Main ----

const resultsFile = process.argv[2] || 'batch1_results.json';
const outputFile = process.argv[3] || 'batch1_failure_report.md';

console.log(`Analyzing failures from ${resultsFile}...`);

const diagnoses = analyzeBatchFailures(resultsFile);

if (diagnoses.length === 0) {
  console.log('No failures found! ✓');
  process.exit(0);
}

console.log(`Found ${diagnoses.length} failures`);

const report = generateReport(diagnoses);
writeFileSync(outputFile, report);

console.log(`\n${report}`);
console.log(`\nReport saved to ${outputFile}`);

// Save retryable URLs for subagent dispatch
const retryableUrls = diagnoses
  .filter(d => d.retryable)
  .map(d => ({ url: d.url, strategy: d.retryStrategy }));

writeFileSync('batch1_retry_queue.json', JSON.stringify(retryableUrls, null, 2));
console.log(`Retry queue saved to batch1_retry_queue.json (${retryableUrls.length} urls)`);
