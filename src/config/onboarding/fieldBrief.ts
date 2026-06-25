import type { BriefingTrackConfig } from "./types";

export const fieldBrief: BriefingTrackConfig = {
  title: "Field Brief",
  accentColor: "#C2552E",
  iconName: "Zap",
  steps: [
    {
      id: "step1",
      type: "welcome",
      welcomeHeader: "Agent, you're in the field.",
      welcomeSubtext: "Your mission: build and execute test operations. Let's get you equipped.",
      welcomeButton: "Accept mission →",
    },
    {
      id: "step2",
      type: "specialty",
      specialtyHeader: "What's your function on this team?",
      specialtySubtext: "This personalizes your dashboard view.",
    },
    {
      id: "step3",
      type: "loadout",
      loadoutHeader: "Here's what you're equipped with:",
    },
    {
      id: "step4",
      type: "checklist",
      checklistHeader: "Agent brief complete. You're field-ready.",
      checklistSubtext: "Knock these out first to get the most out of QAMind AI.",
      checklistItems: [
        { label: "Visit the Generate Tests page", route: "/generate", action: "generate" },
        { label: "Check your assigned project", route: "/projects", action: "projects" },
      ],
      ctaButtonText: "Begin field work →",
    },
  ],
};
