import type { BriefingTrackConfig } from "./types";

export const intelBrief: BriefingTrackConfig = {
  title: "Intel Brief",
  accentColor: "#64748B",
  iconName: "Eye",
  steps: [
    {
      id: "step1",
      type: "welcome",
      welcomeHeader: "Intel Officer. Welcome to the operation.",
      welcomeSubtext: "Your role is to monitor, analyze, and report. No noise. Just signal.",
      welcomeButton: "View intel →",
    },
    {
      id: "step2",
      type: "intel_access",
      accessHeader: "What's in your intel package:",
    },
    {
      id: "step3",
      type: "checklist",
      checklistHeader: "Your intel station is ready.",
      checklistSubtext: "Knock these out first to get the most out of QAMind AI.",
      checklistItems: [
        { label: "Visit your dashboard to begin monitoring", route: "/", action: "dashboard" },
      ],
      ctaButtonText: "Access intel station →",
    },
  ],
};
