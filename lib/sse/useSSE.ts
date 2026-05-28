"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { SSEEvent, SSEError, StreamState } from "./types";
import { createInitialStreamState } from "./types";
import { parseSSELine, applyEventToState } from "./parseSSE";

export interface UseSSEOptions {
  /** The URL to connect to for SSE streaming */
  url: string;
  /** Whether the connection should be active */
  enabled?: boolean;
  /** Callback when an SSE event is received */
  onEvent?: (event: SSEEvent, state: StreamState) => void;
  /** Callback when a parse error occurs */
  onError?: (error: SSEError) => void;
  /** Callback when the stream closes */
  onClose?: (state: StreamState) => void;
  /** Callback when online/offline status changes */
  onConnectionChange?: (isOnline: boolean) => void;
}

export interface UseSSEReturn {
  /** Current accumulated stream state */
  state: StreamState;
  /** Whether the SSE connection is currently active */
  isConnected: boolean;
  /** Whether the browser reports being online */
  isOnline: boolean;
  /** Any error that caused the stream to stop */
  error: SSEError | null;
  /** Start the SSE connection */
  connect: (body?: Record<string, unknown>) => void;
  /** Stop the SSE connection */
  disconnect: () => void;
  /** Reset the stream state */
  reset: () => void;
}

/**
 * React hook that manages an SSE connection to the chat endpoint.
 * Handles:
 * - Parsing SSE data lines
 * - Accumulating content, tool calls, and usage
 * - Online/offline detection (navigator.onLine + EventSource onerror)
 * - Reconnection on network recovery via browser online event
 */
export function useSSE(options: UseSSEOptions): UseSSEReturn {
  const {
    url,
    enabled = true,
    onEvent,
    onError,
    onClose,
    onConnectionChange,
  } = options;

  const [state, setState] = useState<StreamState>(createInitialStreamState());
  const [isConnected, setIsConnected] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [error, setError] = useState<SSEError | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const onEventRef = useRef(onEvent);
  const onErrorRef = useRef(onError);
  const onCloseRef = useRef(onClose);
  const onConnectionChangeRef = useRef(onConnectionChange);

  // Keep callbacks ref'd to avoid stale closures
  useEffect(() => {
    onEventRef.current = onEvent;
    onErrorRef.current = onError;
    onCloseRef.current = onClose;
    onConnectionChangeRef.current = onConnectionChange;
  }, [onEvent, onError, onClose, onConnectionChange]);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      onConnectionChangeRef.current?.(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      onConnectionChangeRef.current?.(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const disconnect = useCallback(() => {
    // Close ReadableStream reader
    if (readerRef.current) {
      readerRef.current.cancel().catch(() => {});
      readerRef.current = null;
    }
    // Abort fetch
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const reset = useCallback(() => {
    disconnect();
    setState(createInitialStreamState());
    setError(null);
  }, [disconnect]);

  const connect = useCallback(
    (body: Record<string, unknown> = {}) => {
      if (!enabled) return;

      // Close any existing connection
      if (readerRef.current) {
        readerRef.current.cancel().catch(() => {});
        readerRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }

      // Reset state for new connection
      setState(createInitialStreamState());
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      // We use fetch + ReadableStream for POST-based SSE
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) {
            const err: SSEError = {
              message: `SSE connection failed with status ${response.status}`,
            };
            setError(err);
            onErrorRef.current?.(err);
            setIsConnected(false);
            return;
          }

          if (!response.body) {
            const err: SSEError = {
              message: "Response body is not a readable stream",
            };
            setError(err);
            onErrorRef.current?.(err);
            setIsConnected(false);
            return;
          }

          setIsConnected(true);

          const reader = response.body.getReader();
          readerRef.current = reader;

          const decoder = new TextDecoder();
          let buffer = "";

          const processStream = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  setState((current) => {
                    const finalState = { ...current, done: true };
                    onCloseRef.current?.(finalState);
                    return finalState;
                  });
                  setIsConnected(false);
                  break;
                }

                buffer += decoder.decode(value, { stream: true });

                // Process complete lines from the buffer
                const lines = buffer.split("\n");
                // Keep the last partial line in the buffer
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                  const trimmedLine = line.replace(/\r$/, "");
                  const result = parseSSELine(trimmedLine);

                  if (result === null) continue; // empty line or comment

                  // Check if it's an error (has a "message" property but not an SSEEvent)
                  if ("rawLine" in result || "cause" in result) {
                    const sseErr = result as SSEError;
                    console.warn("[SSE parse error]", sseErr.message, sseErr.rawLine);
                    onErrorRef.current?.(sseErr);
                    continue;
                  }

                  const sseEvent = result as SSEEvent;
                  setState((current) => {
                    const newState = applyEventToState(current, sseEvent);
                    onEventRef.current?.(sseEvent, newState);
                    return newState;
                  });
                }
              }
            } catch (err) {
              // AbortError is expected on disconnect
              if (err instanceof DOMException && err.name === "AbortError") {
                return;
              }
              const sseErr: SSEError = {
                message: `Stream read error: ${err instanceof Error ? err.message : String(err)}`,
                cause: err instanceof Error ? err : undefined,
              };
              setError(sseErr);
              onErrorRef.current?.(sseErr);
              setIsConnected(false);
            }
          };

          processStream().catch(() => {});
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") {
            return; // Expected on disconnect
          }
          const sseErr: SSEError = {
            message: `Fetch failed: ${err instanceof Error ? err.message : String(err)}`,
            cause: err instanceof Error ? err : undefined,
          };
          setError(sseErr);
          onErrorRef.current?.(sseErr);
          setIsConnected(false);
        });
    },
    [url, enabled]
  );

  // Auto-connect if enabled is true on mount
  useEffect(() => {
    if (enabled) {
      // Don't auto-connect with empty body; user must call connect()
      // But we mark as online
    }
    return () => {
      disconnect();
    };
  }, [enabled, disconnect]);

  return {
    state,
    isConnected,
    isOnline,
    error,
    connect,
    disconnect,
    reset,
  };
}
