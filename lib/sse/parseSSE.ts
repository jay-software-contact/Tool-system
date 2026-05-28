import type {
  SSEEvent,
  SSEError,
  StreamState,
  createInitialStreamState as createInitialStreamStateType,
} from "./types";

export type { SSEEvent, SSEError, StreamState };

// Re-export types for convenience
import { createInitialStreamState as _createInitialStreamState } from "./types";
export { _createInitialStreamState as createInitialStreamState };

/**
 * Parse a single line from an SSE stream.
 * Returns null for empty lines or comments (lines starting with ":").
 * Returns a parsed JSON event for "data:" lines.
 * Returns an SSEError for malformed lines.
 */
export function parseSSELine(line: string): SSEEvent | SSEError | null {
  // Empty line signals end of event — return null (handled by caller)
  if (line === "") return null;

  // SSE comments start with ":"
  if (line.startsWith(":")) return null;

  // "data:" prefix
  const dataPrefix = "data:";
  if (!line.startsWith(dataPrefix)) {
    // Unknown field type — skip gracefully
    return null;
  }

  const payload = line.slice(dataPrefix.length).trim();

  // "[DONE]" sentinel from some streaming APIs
  if (payload === "[DONE]") return null;

  if (!payload) return null;

  try {
    const event = JSON.parse(payload) as SSEEvent;
    return event;
  } catch (err) {
    return {
      message: `Failed to parse SSE data line: ${err instanceof Error ? err.message : String(err)}`,
      rawLine: line,
      cause: err instanceof Error ? err : undefined,
    };
  }
}

/**
 * Accumulate a parsed event into the stream state.
 * Returns a new (immutable) state object.
 */
export function applyEventToState(
  state: StreamState,
  event: SSEEvent
): StreamState {
  switch (event.type) {
    case "content": {
      return {
        ...state,
        content: state.content + event.delta,
      };
    }
    case "tool_start": {
      const existing = state.toolCalls[event.tool_call_id] ?? {
        tool_call_id: event.tool_call_id,
        tool_name: event.tool_name,
        tool_input: "",
        pending: true,
      };
      return {
        ...state,
        toolCalls: {
          ...state.toolCalls,
          [event.tool_call_id]: {
            ...existing,
            tool_name: event.tool_name,
            tool_input: existing.tool_input + event.tool_input,
            pending: true,
          },
        },
      };
    }
    case "tool_end": {
      const existing = state.toolCalls[event.tool_call_id] ?? {
        tool_call_id: event.tool_call_id,
        tool_name: "unknown",
        tool_input: "",
        pending: true,
      };
      return {
        ...state,
        toolCalls: {
          ...state.toolCalls,
          [event.tool_call_id]: {
            ...existing,
            tool_output: event.tool_output,
            success: event.success,
            pending: false,
          },
        },
      };
    }
    case "usage": {
      return {
        ...state,
        usage: {
          input_tokens: event.input_tokens,
          output_tokens: event.output_tokens,
          total_tokens: event.total_tokens,
        },
      };
    }
    default: {
      // Unknown event type — passthrough
      return state;
    }
  }
}
