export type StepType =
  | "welcome"
  | "workspace_setup"
  | "specialty"
  | "features"
  | "scope"
  | "dna_reveal"
  | "loadout"
  | "intel_access"
  | "checklist";

export interface OnboardingStep {
  id: string;
  type: StepType;
  welcomeHeader?: string;
  welcomeSubtext?: string;
  welcomeButton?: string;
  label?: string;
  placeholder?: string;
  note?: string;
  specialtyHeader?: string;
  specialtySubtext?: string;
  featuresHeader?: string;
  featuresSubtext?: string;
  scopeHeader?: string;
  progressLabel?: string;
  terminalLogs?: string[];
  badgeLabel?: string;
  badgeSubtitle?: string;
  loadoutHeader?: string;
  accessHeader?: string;
  checklistHeader?: string;
  checklistSubtext?: string;
  checklistItems?: { label: string; description?: string; route: string; action?: string }[];
  ctaButtonText?: string;
}

export interface BriefingTrackConfig {
  title: string;
  accentColor: string;
  iconName: "Star" | "Crown" | "Shield" | "Zap" | "Eye";
  steps: OnboardingStep[];
}
