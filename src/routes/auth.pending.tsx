import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/backend/supabase";
import { toast } from "sonner";
import {
  getMyPendingInvites,
  acceptInvite,
  declineInvite,
  type PendingInviteResult,
} from "@/backend/api/invite.functions";

export const Route = createFileRoute("/auth/pending")({
  component: AuthPendingPage,
});

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

function AuthPendingPage() {
  const navigate = useNavigate();
  const [invites, setInvites] = useState<PendingInviteResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);
  const [welcomeCardData, setWelcomeCardData] = useState<{ workspaceName: string; role: string } | null>(null);

  const checkOnboardingComplete = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("onboarding_complete").eq("id", userId).maybeSingle();
    return !!data?.onboarding_complete;
  };

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        navigate({ to: "/" });
        return;
      }
      try {
        const result = await getMyPendingInvites({ data: { accessToken: token } });
        if (!result.length) {
          const { data: { user } } = await supabase.auth.getUser();
          const isOnboarded = user ? await checkOnboardingComplete(user.id) : false;
          navigate({ to: isOnboarded ? "/dashboard" : "/onboarding", search: isOnboarded ? undefined : { flow: "owner" } });
          return;
        }
        setInvites(result);
      } catch {
        navigate({ to: "/onboarding", search: { flow: "owner" } });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  async function handleAccept(invite: PendingInviteResult) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;
    setActioningId(invite.id);
    try {
      await acceptInvite({ data: { accessToken: token, inviteId: invite.id } });
      const { data: { user } } = await supabase.auth.getUser();
      const isOnboarded = user ? await checkOnboardingComplete(user.id) : false;
      if (isOnboarded) {
        setWelcomeCardData({ workspaceName: invite.workspace_name, role: invite.role });
        setShowWelcomeCard(true);
      } else {
        navigate({ to: "/onboarding", search: { flow: "invited", workspaceName: invite.workspace_name } });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to join workspace.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleDecline(invite: PendingInviteResult) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;
    setActioningId(invite.id);
    try {
      await declineInvite({ data: { accessToken: token, inviteId: invite.id } });
      const remaining = invites.filter((i) => i.id !== invite.id);
      setInvites(remaining);
      if (!remaining.length) {
        const { data: { user } } = await supabase.auth.getUser();
        const isOnboarded = user ? await checkOnboardingComplete(user.id) : false;
        navigate({ to: isOnboarded ? "/dashboard" : "/onboarding", search: isOnboarded ? undefined : { flow: "owner" } });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to decline invite.");
    } finally {
      setActioningId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="font-display text-3xl">You've been invited</h1>
          <p className="text-sm text-muted-foreground">
            Review your workspace invitations before continuing.
          </p>
        </div>

        <div className="space-y-3">
          {invites.map((invite) => {
            const busy = actioningId === invite.id;
            return (
              <div
                key={invite.id}
                className="rounded-sm border border-border bg-card p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-medium text-foreground truncate">{invite.workspace_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Invited by {invite.inviter_name}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-sm bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                    {ROLE_LABELS[invite.role] ?? invite.role}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(invite)}
                    disabled={busy || actioningId !== null}
                    className="flex-1 rounded-sm bg-foreground py-2 text-sm text-background hover:bg-accent disabled:opacity-60"
                  >
                    {busy ? "Joining..." : "Join workspace"}
                  </button>
                  <button
                    onClick={() => handleDecline(invite)}
                    disabled={busy || actioningId !== null}
                    className="flex-1 rounded-sm border border-border py-2 text-sm text-muted-foreground hover:border-foreground hover:text-foreground disabled:opacity-60"
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={() => navigate({ to: "/onboarding", search: { flow: "owner" } })}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Create my own workspace instead
          </button>
        </div>
      </div>

      {showWelcomeCard && welcomeCardData && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(26,23,20,0.5)] p-4 backdrop-blur-[4px]">
          <div className="w-full max-w-sm rounded-[16px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-[32px] shadow-[var(--shadow-lg)] text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-display text-[20px] text-[var(--c-text)] mb-1">You're now a member of</p>
            <p className="font-display text-[20px] text-[var(--c-accent)] mb-3">{welcomeCardData.workspaceName}</p>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-[var(--c-bg-hover)] text-[var(--c-text-muted)] mb-4">
              {welcomeCardData.role}
            </span>
            <p className="text-[13px] text-[var(--c-text-muted)] mb-6">Head to your dashboard to get started.</p>
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="w-full rounded-[8px] bg-[var(--c-text)] px-6 py-[10px] text-[14px] font-medium text-[var(--c-bg)] hover:opacity-90 transition-all"
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
