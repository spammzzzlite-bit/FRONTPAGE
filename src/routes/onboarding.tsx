import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import OnboardingFlow from "@/frontend/components/OnboardingFlow";
import { supabase } from "@/backend/supabase";
import { useAuth, useCurrentRole, initializeStores } from "@/frontend/store/store";
import { isOnboardingCompleteLocally } from "@/lib/storage-keys";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — QAMind AI" },
      { name: "description", content: "Complete your onboarding setup." },
    ],
  }),
  component: OnboardingPage,
});

async function persistOnboardingComplete(user: {
  id: string;
  email?: string | null;
  user_metadata?: { name?: string };
}) {
  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email ?? null,
    full_name: user.user_metadata?.name ?? null,
    onboarding_complete: true,
  });
}

function OnboardingPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const currentRole = useCurrentRole();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!auth.user?.id || auth.loading) return;
    const email = auth.user.email || "";
    const name = auth.user.user_metadata?.name || email.split("@")[0] || "Workspace Owner";
    void initializeStores(auth.user.id, email, name);
  }, [auth.user?.id, auth.user?.email, auth.user?.user_metadata?.name, auth.loading]);

  useEffect(() => {
    if (auth.loading) return;

    if (!auth.session) {
      navigate({ to: "/auth" });
    } else {
      const checkOnboarding = async () => {
        if (!auth.user?.id) return;

        if (isOnboardingCompleteLocally(auth.user.id)) {
          navigate({ to: "/dashboard" });
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("id", auth.user.id)
          .single();

        if (error && error.code === "PGRST116") {
          await supabase.from("profiles").upsert({
            id: auth.user.id,
            email: auth.user.email,
            full_name: auth.user.user_metadata?.name || "",
            onboarding_complete: false,
          });
          setIsReady(true);
          return;
        }

        if (data?.onboarding_complete) {
          navigate({ to: "/dashboard" });
        } else {
          setIsReady(true);
        }
      };
      checkOnboarding();
    }
  }, [auth.session, auth.loading, auth.user?.id, navigate]);

  const handleComplete = async () => {
    if (auth.user?.id) {
      await persistOnboardingComplete(auth.user);
    }
    navigate({ to: "/dashboard" });
  };

  const handleSkip = async () => {
    if (auth.user?.id) {
      await persistOnboardingComplete(auth.user);
    }
    navigate({ to: "/dashboard" });
  };

  const handleNavigate = (route: string) => {
    navigate({ to: route });
  };

  if (auth.loading || !auth.session || !isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--c-bg)]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--c-border)] border-t-[var(--c-text)]" />
      </div>
    );
  }

  return (
    <OnboardingFlow
      currentRole={currentRole}
      onComplete={handleComplete}
      onSkip={handleSkip}
      onNavigate={handleNavigate}
    />
  );
}
