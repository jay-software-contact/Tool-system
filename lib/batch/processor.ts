/**
 * Batch Processing System
 * 
 * Processes websites in batches of 100:
 * 1. Reads URLs from D:\projects\Websitestools list.txt
 * 2. Dispatches subagents to extract components from each URL
 * 3. Tracks successes and failures
 * 4. Failed URLs go to a retry queue where another agent diagnoses
 */

import { readFileSync } from 'fs';

// ---- Types ----

export interface ExtractionResult {
  url: string;
  status: 'success' | 'failed' | 'skipped';
  componentCount: number;
  error?: string;
  duration?: number;
  batchId: string;
}

export interface BatchProgress {
  batchId: string;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  startedAt: number;
  completedAt?: number;
  results: ExtractionResult[];
  failedUrls: string[];
}

// ---- Parser ----

export function parseWebsiteList(filePath: string, limit?: number): string[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const urls: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('Websites/')) continue;
    
    // Remove leading "- "
    let url = trimmed.replace(/^-\s*/, '');
    
    // Skip empty or invalid
    if (!url || url.startsWith('#')) continue;
    
    // Ensure https:// prefix
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Clean up trailing comments
    url = url.split(/\s/)[0];
    
    urls.push(url);
    
    if (limit && urls.length >= limit) break;
  }
  
  return urls;
}

// ---- Batch Splitter ----

export function createBatches(urls: string[], batchSize: number = 100): string[][] {
  const batches: string[][] = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize));
  }
  return batches;
}

// ---- Progress Tracker ----

export class BatchTracker {
  private progress: Map<string, BatchProgress> = new Map();
  
  startBatch(batchId: string, urls: string[]): BatchProgress {
    const progress: BatchProgress = {
      batchId,
      total: urls.length,
      processed: 0,
      succeeded: 0,
      failed: 0,
      startedAt: Date.now(),
      results: [],
      failedUrls: [],
    };
    this.progress.set(batchId, progress);
    return progress;
  }
  
  recordResult(batchId: string, result: ExtractionResult) {
    const batch = this.progress.get(batchId);
    if (!batch) return;
    
    batch.processed++;
    batch.results.push(result);
    
    if (result.status === 'success') {
      batch.succeeded++;
    } else {
      batch.failed++;
      batch.failedUrls.push(result.url);
    }
  }
  
  completeBatch(batchId: string) {
    const batch = this.progress.get(batchId);
    if (batch) {
      batch.completedAt = Date.now();
    }
  }
  
  getBatch(batchId: string): BatchProgress | undefined {
    return this.progress.get(batchId);
  }
  
  getAllFailed(): string[] {
    const failed: string[] = [];
    for (const batch of this.progress.values()) {
      failed.push(...batch.failedUrls);
    }
    return failed;
  }
  
  getSummary() {
    let totalProcessed = 0;
    let totalSucceeded = 0;
    let totalFailed = 0;
    
    for (const batch of this.progress.values()) {
      totalProcessed += batch.processed;
      totalSucceeded += batch.succeeded;
      totalFailed += batch.failed;
    }
    
    return { totalProcessed, totalSucceeded, totalFailed };
  }
}

// ---- Retry Analyzer ----

export interface RetryAnalysis {
  url: string;
  originalError: string;
  diagnosis: string;
  suggestedFix: string;
  retryable: boolean;
}

export function analyzeFailure(result: ExtractionResult): RetryAnalysis {
  const error = result.error || '';
  
  // Auth wall
  if (error.includes('401') || error.includes('403') || error.includes('auth')) {
    return {
      url: result.url,
      originalError: error,
      diagnosis: 'Authentication required — target site blocks automated access',
      suggestedFix: 'Skip or use authenticated proxy',
      retryable: false,
    };
  }
  
  // Timeout
  if (error.includes('timeout') || error.includes('AbortError')) {
    return {
      url: result.url,
      originalError: error,
      diagnosis: 'Request timed out — site may be slow or require JS rendering',
      suggestedFix: 'Increase timeout or retry with simplified extraction',
      retryable: true,
    };
  }
  
  // Empty response
  if (error.includes('empty') || error.includes('no components')) {
    return {
      url: result.url,
      originalError: error,
      diagnosis: 'No components extracted — page may be JS-rendered or below minimum threshold',
      suggestedFix: 'Retry with DOM-snapshot fallback or skip',
      retryable: true,
    };
  }
  
  // Network error
  if (error.includes('network') || error.includes('ENOTFOUND') || error.includes('ECONNREFUSED')) {
    return {
      url: result.url,
      originalError: error,
      diagnosis: 'Network error — site may be down or unreachable',
      suggestedFix: 'Retry after delay or skip',
      retryable: true,
    };
  }
  
  // Default
  return {
    url: result.url,
    originalError: error,
    diagnosis: 'Unknown error — requires manual investigation',
    suggestedFix: 'Retry with full pipeline or investigate manually',
    retryable: true,
  };
}

// ---- Export ----

export const BATCH_CONFIG = {
  DEFAULT_BATCH_SIZE: 100,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5000,
  EXTRACTION_TIMEOUT_MS: 300000, // 5 minutes per URL
};
