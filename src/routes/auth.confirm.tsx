import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import { supabase } from "@/backend/supabase";
import { toast } from "sonner";
import { PendingInvitesModal, type PendingInvite } from "@/frontend/components/PendingInvitesModal";
import {
  getMyPendingInvites,
  acceptInvite,
  declineInvite,
} from "@/backend/api/invite.functions";

const search = z.object({
  token_hash: z.string().optional(),
  type: z.string().optional(),
});

export const Route = createFileRoute("/auth/confirm")({
  validateSearch: (s) => search.parse(s),
  component: AuthConfirmPage,
});

type Status = "verifying" | "success" | "error" | "idle";

function AuthConfirmPage() {
  const { token_hash, type } = Route.useSearch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>(token_hash ? "verifying" : "idle");
  const [errorMsg, setErrorMsg] = useState("");
  const verified = useRef(false);

  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [showInvitesModal, setShowInvitesModal] = useState(false);
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);
  const [welcomeCardData, setWelcomeCardData] = useState<{ workspaceName: string; role: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const getToken = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    return sessionData.session?.access_token ?? "";
  };

  const checkOnboardingComplete = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("onboarding_complete").eq("id", userId).maybeSingle();
    return !!data?.onboarding_complete;
  };

  const handlePostAuth = async (user: any) => {
    if (!user) return navigate({ to: "/auth" });
    try {
      const accessToken = await getToken();
      const invites = await getMyPendingInvites({ data: { accessToken } });
      if (invites.length > 0) {
        setPendingInvites(invites);
        setShowInvitesModal(true);
      } else {
        const isOnboarded = await checkOnboardingComplete(user.id);
        navigate({ to: isOnboarded ? "/dashboard" : "/onboarding", search: isOnboarded ? undefined : { flow: "owner" } });
      }
    } catch {
      navigate({ to: "/onboarding", search: { flow: "owner" } });
    }
  };

  const handleJoinInvite = async (invite: PendingInvite) => {
    setLoading(true);
    try {
      const accessToken = await getToken();
      await acceptInvite({ data: { accessToken, inviteId: invite.id } });
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const isOnboarded = currentUser ? await checkOnboardingComplete(currentUser.id) : false;
      setShowInvitesModal(false);
      if (isOnboarded) {
        setWelcomeCardData({ workspaceName: invite.workspace_name, role: invite.role });
        setShowWelcomeCard(true);
      } else {
        navigate({ to: "/onboarding", search: { flow: "invited", workspaceName: invite.workspace_name } });
      }
    } catch {
      toast.error("Failed to join workspace.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineInvite = async (invite: PendingInvite) => {
    setLoading(true);
    try {
      const accessToken = await getToken();
      await declineInvite({ data: { accessToken, inviteId: invite.id } });
      const remaining = pendingInvites.filter((i) => i.id !== invite.id);
      setPendingInvites(remaining);
      if (!remaining.length) {
        setShowInvitesModal(false);
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const isOnboarded = currentUser ? await checkOnboardingComplete(currentUser.id) : false;
        navigate({ to: isOnboarded ? "/dashboard" : "/onboarding", search: isOnboarded ? undefined : { flow: "owner" } });
      }
    } catch {
      toast.error("Failed to decline invite.");
    } finally {
      setLoading(false);
    }
  };

  const handleMaybeLater = () => {
    setShowInvitesModal(false);
    navigate({ to: "/auth/pending" });
  };

  const handleCreateOwn = () => {
    setShowInvitesModal(false);
    navigate({ to: "/onboarding", search: { flow: "owner" } });
  };

  useEffect(() => {
    if (!token_hash || !type || verified.current) return;
    verified.current = true;

    supabase.auth
      .verifyOtp({ token_hash, type: type as any })
      .then(({ data, error }) => {
        if (error) {
          setErrorMsg(error.message);
          setStatus("error");
        } else {
          setStatus("success");
          setTimeout(() => handlePostAuth(data.user), 1500);
        }
      });
  }, [token_hash, type]);

  if (status === "idle") {
    navigate({ to: "/auth" });
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        {status === "verifying" && (
          <div className="space-y-4">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
            <p className="font-medium text-foreground">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium text-foreground">Email verified! Taking you in...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <h2 className="font-display text-3xl">Link expired or invalid</h2>
            <p className="text-sm text-muted-foreground">
              {errorMsg || "This confirmation link has expired or is no longer valid."}
            </p>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="inline-block w-full rounded-sm bg-foreground py-2.5 text-sm text-background hover:bg-accent"
            >
              Back to sign in
            </Link>
          </div>
        )}
      </div>

      {showInvitesModal && (
        <PendingInvitesModal
          invites={pendingInvites}
          onJoin={handleJoinInvite}
          onDecline={handleDeclineInvite}
          onCreateOwn={handleCreateOwn}
          onMaybeLater={handleMaybeLater}
          isLoading={loading}
        />
      )}

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
