"use client";

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";

interface ChatMessage {
  id: number;
  role: "operator" | "agent";
  text: string;
}

let nextId = 1;

export default function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    setInput("");
    setStreaming(true);

    const operatorMsg: ChatMessage = { id: nextId++, role: "operator", text };
    const agentId = nextId++;
    setMessages((prev) => [...prev, operatorMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { id: agentId, role: "agent", text: "Error: failed to reach Hermes." },
        ]);
        setStreaming(false);
        return;
      }

      const data = await res.json();

      if (data.type === "content" && data.text) {
        // Simulate streaming by revealing text character by character
        const fullText = data.text;
        let displayed = "";
        for (let i = 0; i <= fullText.length; i++) {
          displayed = fullText.slice(0, i);
          const currentDisplayed = displayed;
          setMessages((prev) => {
            const exists = prev.find((m) => m.id === agentId);
            if (exists) {
              return prev.map((m) =>
                m.id === agentId ? { ...m, text: currentDisplayed } : m
              );
            }
            return [...prev, { id: agentId, role: "agent", text: currentDisplayed }];
          });
          if (i < fullText.length) {
            await new Promise((r) => setTimeout(r, 18));
          }
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { id: agentId, role: "agent", text: "(empty response)" },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: agentId, role: "agent", text: "Error: connection failed." },
      ]);
    }

    setStreaming(false);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-60px)]">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 border-b border-white/5">
        <h2 className="font-display text-xl font-bold text-primary mb-0.5">
          Hermes Chat
        </h2>
        <p className="text-xs text-secondary">
          Streaming interface — simulated response
        </p>
      </div>

      {/* Messages */}
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
                <p className="text-sm text-secondary whitespace-pre-wrap">
                  {msg.text}
                  {streaming &&
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

      {/* Token Footer — shown after first exchange */}
      {hasMessages && (
        <div className="px-6 py-2 border-t border-white/5 bg-deep/80 flex items-center gap-4 text-[11px] text-secondary">
          <span>
            <i className="fas fa-bolt text-accent1/60 mr-1" />
            Tokens — in: ~{messages
              .filter((m) => m.role === "operator")
              .reduce((acc, m) => acc + m.text.length, 0)}{" "}
            / out: ~{messages
              .filter((m) => m.role === "agent")
              .reduce((acc, m) => acc + m.text.length, 0)}
          </span>
          <span>
            <i className="fas fa-clock text-accent1/60 mr-1" />
            Messages: {messages.length}
          </span>
        </div>
      )}

      {/* Input */}
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
            placeholder="Type a message…"
            rows={2}
            disabled={streaming}
            className="flex-1 bg-[#141820] border border-white/10 rounded-[10px] px-4 py-2.5 text-sm text-primary placeholder:text-secondary/40 focus:outline-none focus:border-accent1/40 resize-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="bg-accent1/20 hover:bg-accent1/30 text-accent1 border border-accent1/30 rounded-[10px] px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="fas fa-paper-plane text-xs" />
          </button>
        </div>
      </form>
    </div>
  );
}
