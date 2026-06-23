export const GPT_HOST = "gpt.qamind.ai";

export function isGptSite(hostname?: string): boolean {
  const host =
    hostname ||
    (typeof window !== "undefined" ? window.location.hostname : "");
  return host === GPT_HOST || host === `www.${GPT_HOST}`;
}

export function gptAuthRedirectPath(): "/gpt" {
  return "/gpt";
}
