import type { BriefingTrackConfig } from "./types";

export const commandBrief: BriefingTrackConfig = {
  title: "Command Brief",
  accentColor: "#C2552E",
  iconName: "Crown",
  steps: [
    {
      id: "step1",
      type: "welcome",
      welcomeHeader: "Commander, your operation begins.",
      welcomeSubtext: "QAMind AI is your command center. Let's set it up.",
      welcomeButton: "Begin setup →",
    },
    {
      id: "step2",
      type: "workspace_setup",
      label: "Name your operation",
      placeholder: "e.g., Phoenix Release / Project Atlas",
      note: "This becomes your workspace name visible to all operatives.",
    },
    {
      id: "step3",
      type: "specialty",
      specialtyHeader: "What's your primary function in the field?",
      specialtySubtext: "This personalizes your dashboard view.",
    },
    {
      id: "step4",
      type: "features",
      featuresHeader: "As Commander, your full arsenal:",
      featuresSubtext: "You have full access.",
    },
    {
      id: "step5",
      type: "dna_reveal",
      progressLabel: "Compiling operative dossier...",
      terminalLogs: [
        "Scanning role permissions...",
        "Assigning command clearance...",
        "Generating operative badge...",
      ],
      badgeLabel: "COMMANDER",
      badgeSubtitle: "Full Operational Access · QAMind AI QA",
    },
    {
      id: "step6",
      type: "checklist",
      checklistHeader: "Pre-mission checklist",
      checklistSubtext: "Knock these out first to get the most out of QAMind AI.",
      checklistItems: [
        { label: "Name your workspace operation", route: "/settings", action: "settings" },
        { label: "Review your command permissions", route: "/settings", action: "settings" },
        { label: "Invite your first operative", route: "/settings", action: "settings" },
        { label: "Create your first project", route: "/projects", action: "projects" },
      ],
      ctaButtonText: "Deploy to Command Center →",
    },
  ],
};
