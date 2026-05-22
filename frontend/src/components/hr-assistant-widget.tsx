"use client";

import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  askHrAssistant,
  getApiErrorMessage,
  type HrAssistantChatMessage
} from "@/lib/api";

type HrAssistantWidgetProps = {
  token: string;
};

type AssistantMessage = HrAssistantChatMessage & {
  id: string;
};

const promptSuggestions = [
  "How many leaves do I have left?",
  "When is my next payroll?",
  "Who is my manager?"
];

function createMessage(role: HrAssistantChatMessage["role"], content: string): AssistantMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content
  };
}

function toChatHistory(messages: AssistantMessage[]): HrAssistantChatMessage[] {
  return messages.slice(-8).map((message) => ({
    role: message.role,
    content: message.content
  }));
}

export function HrAssistantWidget({ token }: HrAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const messageContainer = messagesRef.current;

    if (!messageContainer) {
      return;
    }

    messageContainer.scrollTop = messageContainer.scrollHeight;
  }, [messages, isSubmitting]);

  async function submitMessage(messageText: string) {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || isSubmitting) {
      return;
    }

    const userMessage = createMessage("user", trimmedMessage);
    const history = toChatHistory(messages);

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setIsSubmitting(true);

    try {
      const response = await askHrAssistant(token, {
        message: trimmedMessage,
        history
      });

      const assistantText = response.success
        ? response.data.reply
        : getApiErrorMessage(response);

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", assistantText)
      ]);
    } catch (error) {
      console.error(error);
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", "Unable to reach the HR Assistant API right now.")
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage(input);
  }

  return (
    <div className="fixed bottom-3 right-3 z-50 flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-2 sm:bottom-5 sm:right-5">
      {isOpen ? (
        <section
          className="flex h-[min(440px,calc(100vh-96px))] w-[calc(100vw-1.5rem)] max-w-[320px] flex-col overflow-hidden rounded-lg border border-white/55 bg-white/82 shadow-[0_18px_48px_rgba(15,23,42,0.24),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl dark:border-white/12 dark:bg-slate-950/82 dark:shadow-[0_18px_48px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.08)]"
          aria-label="HR Assistant chat"
        >
          <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/60 bg-white/45 px-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex min-w-0 items-center gap-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-slate-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:bg-white dark:text-slate-950">
                <Bot size={16} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-[13px] font-semibold text-slate-950 dark:text-white">
                  HR Assistant
                </h2>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  Ask HR data
                </p>
              </div>
            </div>
            <button
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/60 bg-white/45 text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-white/80 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close HR Assistant"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </header>

          <div ref={messagesRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
            {messages.length === 0 ? (
              <div className="space-y-2 py-1">
                <div className="rounded-lg border border-white/60 bg-white/52 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur dark:border-white/10 dark:bg-white/5">
                  <p className="text-[13px] font-medium text-slate-900 dark:text-white">
                    Ask about HR data.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    Leave, payroll, and manager answers.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {promptSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      className="inline-flex max-w-full items-center gap-1 rounded-md border border-white/60 bg-white/60 px-2 py-1 text-left text-[11px] font-medium text-slate-700 shadow-sm backdrop-blur transition hover:border-slate-300 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10"
                      type="button"
                      onClick={() => void submitMessage(suggestion)}
                      disabled={isSubmitting}
                    >
                      <Sparkles size={12} aria-hidden="true" />
                      <span className="whitespace-normal">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => {
                  const isUserMessage = message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[84%] break-words rounded-lg px-2.5 py-1.5 text-xs leading-5 shadow-sm ${
                          isUserMessage
                            ? "bg-slate-950/95 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:bg-white dark:text-slate-950"
                            : "border border-white/60 bg-white/58 text-slate-800 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  );
                })}
                {isSubmitting ? (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-2 rounded-lg border border-white/60 bg-white/58 px-2.5 py-1.5 text-xs text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                      <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                      Checking
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <form className="shrink-0 border-t border-white/60 bg-white/35 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5" onSubmit={handleSubmit}>
            <div className="flex min-w-0 items-end gap-2">
              <textarea
                className="min-h-9 max-h-24 flex-1 resize-none rounded-md border border-white/60 bg-white/70 px-2.5 py-2 text-xs text-slate-950 shadow-sm outline-none backdrop-blur transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-white/70 disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/20 dark:focus:ring-white/10"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void submitMessage(input);
                  }
                }}
                placeholder="Ask HR"
                rows={1}
                disabled={isSubmitting}
              />
              <button
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-slate-950 text-white shadow-[0_10px_20px_rgba(15,23,42,0.20),inset_0_1px_0_rgba(255,255,255,0.20)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                type="submit"
                disabled={isSubmitting || input.trim().length === 0}
                aria-label="Send message"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Send size={16} aria-hidden="true" />
                )}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <button
        className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-white/20 bg-slate-950/95 text-white shadow-[0_14px_30px_rgba(15,23,42,0.28),inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white/95 dark:text-slate-950 dark:hover:bg-white"
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-label={isOpen ? "Close HR Assistant" : "Open HR Assistant"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={20} aria-hidden="true" /> : <MessageCircle size={20} aria-hidden="true" />}
      </button>
    </div>
  );
}