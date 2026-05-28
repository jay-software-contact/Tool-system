"use client";

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";

interface ToolIndicator {
  id: string;
  name: string;
}

interface ChatMessage {
  id: number;
  role: "operator" | "agent";
  text: string;
  toolIndicators: ToolIndicator[];
  promptTokens: number;
  completionTokens: number;
}

let nextId = 1;
let streamCancelled = false;

export default function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [activeStream, setActiveStream] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submitMessage(input);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage(input);
    }
  }

  function submitMessage(messageText: string) {
    const text = messageText.trim();
    if (!text || activeStream) return;

    setInput("");

    const operatorMsg: ChatMessage = {
      id: nextId++,
      role: "operator",
      text,
      toolIndicators: [],
      promptTokens: 0,
      completionTokens: 0,
    };

    const agentId = nextId++;
    const agentMsg: ChatMessage = {
      id: agentId,
      role: "agent",
      text: "",
      toolIndicators: [],
      promptTokens: 0,
      completionTokens: 0,
    };

    streamCancelled = false;
    setMessages((prev) => [...prev, operatorMsg, agentMsg]);
    setActiveStream(true);

    const controller = new AbortController();
    abortRef.current = controller;

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === agentId
                ? { ...m, text: "The Hermes Agent endpoint did not return a valid SSE stream (HTTP " + response.status + ")." }
                : m
            )
          );
          setActiveStream(false);
          return;
        }

        if (!response.body) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === agentId
                ? { ...m, text: "The Hermes Agent endpoint returned an empty response body." }
                : m
            )
          );
          setActiveStream(false);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let receivedAnyData = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done || streamCancelled) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const rawLine of lines) {
              const line = rawLine.trim();
              if (!line.startsWith("data:")) continue;

              const jsonStr = line.slice(5).trim();
              if (!jsonStr) continue;

              let payload: Record<string, unknown>;
              try {
                payload = JSON.parse(jsonStr);
              } catch {
                continue;
              }

              receivedAnyData = true;

              if (payload.type === "content") {
                const chunk = typeof payload.text === "string" ? payload.text : "";
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === agentId ? { ...m, text: m.text + chunk } : m
                  )
                );
              } else if (payload.type === "tool_start") {
                const toolName = typeof payload.name === "string" ? payload.name : "unknown";
                const toolId = "tool-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === agentId
                      ? {
                          ...m,
                          toolIndicators: [
                            ...m.toolIndicators,
                            { id: toolId, name: toolName },
                          ],
                        }
                      : m
                  )
                );
              } else if (payload.type === "tool_end") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === agentId
                      ? { ...m, toolIndicators: m.toolIndicators.slice(0, -1) }
                      : m
                  )
                );
              } else if (payload.type === "usage") {
                const promptTok = typeof payload.prompt_tokens === "number" ? payload.prompt_tokens : 0;
                const completionTok = typeof payload.completion_tokens === "number" ? payload.completion_tokens : 0;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === agentId
                      ? { ...m, promptTokens: promptTok, completionTokens: completionTok }
                      : m
                  )
                );
                setTotalTokens((prev) => prev + promptTok + completionTok);
              }
            }
          }

          if (!receivedAnyData) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === agentId
                  ? { ...m, text: "Error: No data received from Hermes Agent." }
                  : m
              )
            );
          }
        } catch {
          if (!streamCancelled) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === agentId
                  ? { ...m, text: m.text + "\n\n[stream interrupted]" }
                  : m
              )
            );
          }
        } finally {
          setActiveStream(false);
          textareaRef.current?.focus();
        }
      })
      .catch(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === agentId
              ? { ...m, text: "The Hermes Agent endpoint did not return a valid SSE stream." }
              : m
          )
        );
        setActiveStream(false);
        textareaRef.current?.focus();
      });
  }

  function handleStop() {
    streamCancelled = true;
    abortRef.current?.abort();
    setActiveStream(false);
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-60px)]">
      <div className="px-6 pt-5 pb-3 border-b border-white/5">
        <h2 className="font-display text-xl font-bold text-primary mb-0.5">
          Hermes Chat
        </h2>
        <p className="text-xs text-secondary">
          Streaming interface — live agent responses
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {!hasMessages && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-robot text-3xl text-accent1/30 mb-3" />
              <p className="text-secondary text-sm">
                Send a message to begin the session.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) =>
          msg.role === "operator" ? (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[70%] bg-accent1/15 border border-accent1/30 rounded-[10px] px-4 py-2.5">
                <p className="text-sm text-primary whitespace-pre-wrap">
                  {msg.text}
                </p>
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex justify-start">
              <div className="max-w-[70%] bg-[#141820] border border-white/5 rounded-[10px] px-4 py-2.5">
                {msg.toolIndicators.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.toolIndicators.map((tool) => (
                      <span
                        key={tool.id}
                        className="inline-flex items-center gap-1.5 text-[11px] text-accent1 bg-accent1/10 border border-accent1/20 rounded-md px-2 py-0.5"
                      >
                        <i className="fas fa-spinner fa-spin text-[10px]" />
                        {tool.name}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-secondary whitespace-pre-wrap">
                  {msg.text}
                  {activeStream &&
                    msg.id === messages[messages.length - 1]?.id && (
                      <span className="inline-block w-1.5 h-4 bg-accent1/70 ml-0.5 animate-pulse" />
                    )}
                </p>
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {hasMessages && (
        <div className="px-6 py-2 border-t border-white/5 bg-deep/80 flex items-center gap-4 text-[11px] text-secondary">
          <span>
            <i className="fas fa-bolt text-accent1/60 mr-1" />
            Tokens — total: {totalTokens.toLocaleString()}
          </span>
          <span>
            <i className="fas fa-clock text-accent1/60 mr-1" />
            Messages: {messages.length}
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="px-6 py-4 border-t border-white/5"
      >
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            rows={2}
            disabled={activeStream}
            className="flex-1 bg-[#141820] border border-white/10 rounded-[10px] px-4 py-2.5 text-sm text-primary placeholder:text-secondary/40 focus:outline-none focus:border-accent1/40 resize-none disabled:opacity-50"
          />
          {activeStream ? (
            <button
              type="button"
              onClick={handleStop}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-[10px] px-4 py-2.5 text-sm font-medium transition-colors"
            >
              <i className="fas fa-stop text-xs" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-accent1/20 hover:bg-accent1/30 text-accent1 border border-accent1/30 rounded-[10px] px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <i className="fas fa-paper-plane text-xs" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
