import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Loader2, Maximize2, MessageSquare, Minimize2, Send, X } from "lucide-react";
import { sendChatMessage } from "../../lib/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  rulesUsed?: Array<{
    id: string;
    title: string;
  }>;
  searchUsed?: boolean;
  sources?: Array<{ title: string; url: string; domain: string }>;
  answerConfidence?: "kb" | "live" | "training" | "fallback";
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreateSessionId() {
  const key = "a11yplay-chat-session";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const created =
    window.crypto?.randomUUID?.() || `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(key, created);
  return created;
}

function ConfidenceBadge({ confidence }: { confidence?: string }) {
  if (!confidence || confidence === "training") return null;

  const configs = {
    live: {
      label: "Live Search",
      className: "bg-emerald-50 border-emerald-200 text-emerald-700",
      dot: "bg-emerald-400",
    },
    kb: {
      label: "Knowledge Base",
      className: "bg-indigo-50 border-indigo-200 text-indigo-700",
      dot: "bg-indigo-400",
    },
    fallback: {
      label: "Could not verify",
      className: "bg-amber-50 border-amber-200 text-amber-700",
      dot: "bg-amber-400",
    },
  };

  const config = configs[confidence as keyof typeof configs];
  if (!config) return null;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => getOrCreateSessionId());
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi, I am your A11yPlay WCAG Assistant. Ask me how to fix contrast, alt text, keyboard focus, forms, or any WCAG issue.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput("");
    setIsLoading(true);
    setMessages((current) => [...current, { id: newId(), role: "user", content: trimmed }]);

    try {
      const response = await sendChatMessage(sessionId, trimmed);
      setMessages((current) => [
        ...current,
        {
          id: newId(),
          role: "assistant",
          content: response.response,
          rulesUsed: response.rules_used,
          searchUsed: response.search_used,
          sources: response.sources,
          answerConfidence: response.answer_confidence,
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Chat request failed.";
      setMessages((current) => [
        ...current,
        {
          id: newId(),
          role: "assistant",
          content: `${message} Please check GROQ_API_KEY on the backend and VITE_API_URL on the frontend.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-900/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
        aria-label="Open A11yPlay WCAG Assistant"
      >
        <MessageSquare className="h-6 w-6" aria-hidden="true" />
      </button>
    );
  }

  return (
    <section
      aria-label="A11yPlay WCAG Assistant"
      className={`fixed z-50 flex flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 transition-all ${
        isExpanded
          ? "inset-4 rounded-xl sm:inset-8"
          : "bottom-5 right-5 h-[560px] max-h-[calc(100vh-2rem)] w-[390px] max-w-[calc(100vw-2rem)] rounded-xl"
      }`}
    >
      <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Bot className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-extrabold text-slate-900">WCAG Assistant</h2>
            <p className="truncate text-[11px] font-semibold text-slate-500">A11yPlay knowledge base + AI</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            aria-label={isExpanded ? "Minimize assistant" : "Maximize assistant"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-4" aria-live="polite">
        {messages.map((message) => (
          <article key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[88%] rounded-xl px-3.5 py-3 text-sm leading-6 shadow-xxs ${
                message.role === "user"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-800"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.answerConfidence && message.answerConfidence !== "training" && (
                <div className="mt-2">
                  <ConfidenceBadge confidence={message.answerConfidence} />
                </div>
              )}
              {message.rulesUsed && message.rulesUsed.length > 0 && (
                <div className="mt-3 border-t border-slate-200 pt-2">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-500">
                    Referenced WCAG Rules
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {message.rulesUsed.map((rule) => (
                      <span
                        key={rule.id}
                        className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-950"
                      >
                        <span className="font-mono">{rule.id}</span>
                        <span className="max-w-[10rem] truncate">{rule.title}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 border-t border-slate-100 pt-2">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Sources
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {message.sources.map((source, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                      >
                        {source.domain}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-600 shadow-xxs">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" aria-hidden="true" />
              Thinking through WCAG context
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3">
        <label htmlFor="wcag-assistant-message" className="sr-only">
          Ask the WCAG assistant
        </label>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            id="wcag-assistant-message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            rows={2}
            placeholder="Ask about alt text, contrast, keyboard access..."
            className="min-h-11 flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="Send message"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </section>
  );
}
