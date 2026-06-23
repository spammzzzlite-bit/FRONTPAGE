import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useAuth } from "@/frontend/store/store";
import { chatWithLocalLlm } from "@/backend/api/chat.functions";
import { Button } from "@/frontend/components/ui/button";
import { toast } from "sonner";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export const Route = createFileRoute("/gpt/")({
  component: GptChatPage,
});

function GptChatPage() {
  const auth = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi — I'm your private Qwen assistant running on your workstation. Ask me anything about QA, test ideas, or general help.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    const accessToken = auth.session?.access_token;
    if (!accessToken) {
      toast.error("Please sign in again.");
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const history = nextMessages
        .filter((message) => message.id !== "welcome")
        .map((message) => ({
          role: message.role,
          content: message.content,
        }));

      const result = await chatWithLocalLlm({
        data: {
          accessToken,
          messages: history.length ? history : [{ role: "user", content: text }],
        },
      });

      if (!result.success || !("text" in result) || !result.text) {
        const message =
          "error" in result && result.error
            ? result.error
            : "No response from your workstation model.";
        setError(message);
        throw new Error(message);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.text,
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Chat failed.";
      setError(message);
      toast.error(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto flex h-[calc(100vh-65px)] w-full max-w-3xl flex-col px-4 py-4 md:px-6">
      <div className="mb-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        Responses come from your local Ollama model on your workstation. Keep Tailscale and
        Ollama running on that machine.
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking on your workstation…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="mt-4 flex items-end gap-2 border-t border-border pt-4"
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage();
        }}
      >
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask your local Qwen model…"
          rows={2}
          className="min-h-[52px] flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendMessage();
            }
          }}
        />
        <Button type="submit" disabled={sending || !input.trim()} className="h-[52px] px-4">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </main>
  );
}
