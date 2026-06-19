import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import OnboardingFlow from "@/frontend/components/OnboardingFlow";
import { supabase } from "@/backend/supabase";
import { useAuth, useCurrentRole } from "@/frontend/store/store";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — QAMind AI" },
      { name: "description", content: "Complete your onboarding setup." },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const currentRole = useCurrentRole();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (auth.loading) return;

    if (!auth.session) {
      navigate({ to: "/auth" });
    } else {
      const checkOnboarding = async () => {
        if (!auth.user?.id) return;
        const { data } = await supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("id", auth.user.id)
          .single();

        if (data?.onboarding_complete) {
          navigate({ to: "/" });
        } else {
          setIsReady(true);
        }
      };
      checkOnboarding();
    }
  }, [auth.session, auth.loading, auth.user?.id, navigate]);

  const handleComplete = async () => {
    if (auth.user?.id) {
      await supabase.from("profiles").update({ onboarding_complete: true }).eq("id", auth.user.id);
    }
    navigate({ to: "/" });
  };

  const handleSkip = async () => {
    if (auth.user?.id) {
      await supabase.from("profiles").update({ onboarding_complete: true }).eq("id", auth.user.id);
    }
    navigate({ to: "/" });
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
