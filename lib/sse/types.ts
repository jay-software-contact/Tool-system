// ---- SSE Event Types ----
// These map to the four event types the chat streaming endpoint emits.

export type SSEEventType = "content" | "tool_start" | "tool_end" | "usage";

export interface SSEContentEvent {
  type: "content";
  /** Text delta to append to the current assistant message */
  delta: string;
}

export interface SSEToolStartEvent {
  type: "tool_start";
  /** Unique tool call id for correlating start/end */
  tool_call_id: string;
  /** Name of the tool being invoked */
  tool_name: string;
  /** Input arguments as a JSON string (may be partial/streaming) */
  tool_input: string;
}

export interface SSEToolEndEvent {
  type: "tool_end";
  /** Matches the tool_call_id from the corresponding tool_start */
  tool_call_id: string;
  /** Final output from the tool */
  tool_output: string;
  /** Whether the tool execution succeeded */
  success: boolean;
}

export interface SSEUsageEvent {
  type: "usage";
  /** Tokens consumed so far in this request */
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export type SSEEvent =
  | SSEContentEvent
  | SSEToolStartEvent
  | SSEToolEndEvent
  | SSEUsageEvent;

// ---- SSE Error ----

export interface SSEError {
  message: string;
  rawLine?: string;
  cause?: Error;
}

// ---- Stream State ----

export interface ToolCall {
  tool_call_id: string;
  tool_name: string;
  tool_input: string;
  tool_output?: string;
  success?: boolean;
  pending: boolean;
}

export interface StreamState {
  /** Accumulated text content from the assistant */
  content: string;
  /** Tool calls seen so far, keyed by tool_call_id */
  toolCalls: Record<string, ToolCall>;
  /** Latest usage numbers */
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  /** Whether the stream has finished */
  done: boolean;
}

export function createInitialStreamState(): StreamState {
  return {
    content: "",
    toolCalls: {},
    usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
    done: false,
  };
}

// ---- Listener Callback Types ----

export type SSEEventListener = (event: SSEEvent, state: StreamState) => void;
export type SSEErrorListener = (error: SSEError) => void;
export type SSECloseListener = (state: StreamState) => void;
