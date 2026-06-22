import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import OnboardingFlow from "@/frontend/components/OnboardingFlow";
import { supabase } from "@/backend/supabase";
import { useAuth, useCurrentRole, initializeStores } from "@/frontend/store/store";

const search = z.object({
  flow: z.enum(["owner", "invited"]).optional(),
  workspaceName: z.string().optional(),
});

export const Route = createFileRoute("/onboarding")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Onboarding — QAMind AI" },
      { name: "description", content: "Complete your onboarding setup." },
    ],
  }),
  component: OnboardingPage,
});

async function persistOnboardingComplete(userId: string, email?: string | null, fullName?: string | null) {
  await supabase.from("profiles").upsert({
    id: userId,
    email: email ?? null,
    full_name: fullName ?? null,
    onboarding_complete: true,
    onboarding_step: 0,
  });
}

function OnboardingPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const currentRole = useCurrentRole();
  const { flow, workspaceName } = Route.useSearch();

  const [isReady, setIsReady] = useState(false);
  const [resumeStep, setResumeStep] = useState(0);

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
      return;
    }

    const checkOnboarding = async () => {
      if (!auth.user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("onboarding_complete, onboarding_step, onboarding_flow")
        .eq("id", auth.user.id)
        .single();

      if (error && error.code === "PGRST116") {
        await supabase.from("profiles").upsert({
          id: auth.user.id,
          email: auth.user.email,
          full_name: auth.user.user_metadata?.name || "",
          onboarding_complete: false,
          onboarding_flow: flow ?? "owner",
          onboarding_step: 0,
        });
        setIsReady(true);
        return;
      }

      if (data?.onboarding_complete) {
        navigate({ to: "/dashboard" });
        return;
      }

      if (data?.onboarding_step) {
        setResumeStep(data.onboarding_step);
      }

      setIsReady(true);
    };

    checkOnboarding();
  }, [auth.session, auth.loading, auth.user?.id, navigate, flow]);

  const handleStepChange = async (step: number) => {
    if (!auth.user?.id) return;
    await supabase.from("profiles").upsert({
      id: auth.user.id,
      onboarding_flow: flow ?? "owner",
      onboarding_step: step,
    });
  };

  const handleComplete = async () => {
    if (auth.user?.id) {
      await persistOnboardingComplete(
        auth.user.id,
        auth.user.email,
        auth.user.user_metadata?.name,
      );
    }
    navigate({ to: "/dashboard" });
  };

  const handleSkip = async () => {
    if (auth.user?.id) {
      await persistOnboardingComplete(
        auth.user.id,
        auth.user.email,
        auth.user.user_metadata?.name,
      );
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
      flow={flow ?? "owner"}
      joinedWorkspaceName={workspaceName}
      initialStep={resumeStep}
      onComplete={handleComplete}
      onSkip={handleSkip}
      onStepChange={handleStepChange}
      onNavigate={handleNavigate}
    />
  );
}
