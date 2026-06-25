import { siTestrail } from "simple-icons";

export type IntegrationIcon =
  | { type: "img"; url: string; lightColor: string; darkColor: string; invertInDark?: boolean }
  | { type: "svg"; path: string; lightColor: string; darkColor: string; invertInDark?: boolean }
  | { type: "mono"; letter: string; lightColor: string; darkColor: string };

export const INTEGRATION_ICONS: Record<string, IntegrationIcon> = {
  Jira: {
    type: "img",
    url: "/brand/integrations/jira.svg",
    lightColor: "#0052CC",
    darkColor: "#4C9AFF",
  },
  "GitHub Actions": {
    type: "img",
    url: "/brand/integrations/github_actions.svg",
    lightColor: "#000000",
    darkColor: "#FFFFFF",
    invertInDark: true,
  },
  "GitLab CI": {
    type: "img",
    url: "/brand/integrations/gitlab_ci.svg",
    lightColor: "#FC6D26",
    darkColor: "#FC6D26",
  },
  Bitbucket: {
    type: "img",
    url: "/brand/integrations/bitbucket.svg",
    lightColor: "#0052CC",
    darkColor: "#4C9AFF",
  },
  Jenkins: {
    type: "img",
    url: "/brand/integrations/jenkins.svg",
    lightColor: "#D24939",
    darkColor: "#D24939",
  },
  Cypress: {
    type: "img",
    url: "/brand/integrations/cypress.svg",
    lightColor: "#17202C",
    darkColor: "#69D3A7",
  },
  Slack: {
    type: "img",
    url: "/brand/integrations/slack.svg",
    lightColor: "#611f69",
    darkColor: "#E01E5A",
  },
  "Azure DevOps": {
    type: "img",
    url: "/brand/integrations/azure_devops.svg",
    lightColor: "#0078D4",
    darkColor: "#50B0F0",
  },
  Playwright: {
    type: "img",
    url: "/brand/integrations/playwright.svg",
    lightColor: "#2EAD33",
    darkColor: "#2EAD33",
  },
  TestRail: {
    type: "svg",
    path: siTestrail.path,
    lightColor: "#65C179",
    darkColor: "#65C179",
  },
  "Zephyr Scale": {
    type: "svg",
    path: "M37.03 44.42H26.97l-1.784 5.692h13.626zM64 50.113l-5.276-16.39 3.408-10.566-12.674-9.23-8.927 6.465H23.47l-8.927-6.504-12.674 9.2 3.408 10.64L0 50.113h16.646l-1.293-4.136L32 33.805l16.646 12.2-1.293 4.098z",
    lightColor: "#ff730b",
    darkColor: "#ff730b",
  },
};
