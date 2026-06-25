import type { BriefingTrackConfig } from "./types";

export const opsBrief: BriefingTrackConfig = {
  title: "Ops Brief",
  accentColor: "#C2552E",
  iconName: "Shield",
  steps: [
    {
      id: "step1",
      type: "welcome",
      welcomeHeader: "Ops Officer, your briefing.",
      welcomeSubtext: "You've been assigned to manage this operation. Here's your scope.",
      welcomeButton: "Read briefing →",
    },
    {
      id: "step2",
      type: "specialty",
      specialtyHeader: "What's your primary function?",
      specialtySubtext: "This personalizes your dashboard view.",
    },
    {
      id: "step3",
      type: "scope",
      scopeHeader: "Your operational scope:",
    },
    {
      id: "step4",
      type: "dna_reveal",
      progressLabel: "Validating ops clearance...",
      terminalLogs: [
        "Validating ops clearance...",
        "Loading team management suite...",
        "Badge assignment complete.",
      ],
      badgeLabel: "OPS OFFICER",
      badgeSubtitle: "Management Clearance · QAMind AI QA",
    },
    {
      id: "step5",
      type: "checklist",
      checklistHeader: "Ready to operate.",
      checklistSubtext: "Knock these out first to get the most out of QAMind AI.",
      checklistItems: [
        { label: "Review your team's current projects", route: "/projects", action: "projects" },
        { label: "Configure an integration", route: "/integrations", action: "integrations" },
        { label: "Add a team member", route: "/settings", action: "settings" },
      ],
      ctaButtonText: "Enter Operations Center →",
    },
  ],
};
