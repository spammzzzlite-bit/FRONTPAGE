import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { LogOut, Sparkles } from "lucide-react";
import { supabase } from "@/backend/supabase";
import { signOut, useAuth } from "@/frontend/store/store";
import { isGptSite } from "@/lib/gpt-site";
import { Button } from "@/frontend/components/ui/button";

export const Route = createFileRoute("/gpt")({
  head: () => ({
    meta: [
      { title: "QAMind GPT — Private local AI chat" },
      {
        name: "description",
        content: "Chat with your private Qwen model hosted on your workstation.",
      },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/auth",
        search: { mode: "signin", next: "/gpt" },
      });
    }
  },
  component: GptLayout,
});

function GptLayout() {
  const auth = useAuth();
  const onGptHost = isGptSite();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">QAMind GPT</p>
            <p className="text-xs text-muted-foreground">
              Powered by your workstation · {onGptHost ? "gpt.qamind.ai" : "qamind.ai/gpt"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground md:inline">
            {auth.email}
          </span>
          {!onGptHost && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">QA Dashboard</Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void signOut().then(() => {
                window.location.href = onGptHost ? "/auth" : "/";
              });
            }}
          >
            <LogOut className="mr-1 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
