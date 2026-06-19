const PREFIX = "qamind";
const LEGACY_PREFIX = "fieldnotes";

function toLegacyKey(key: string): string {
  if (key.startsWith(`${PREFIX}.`)) {
    return `${LEGACY_PREFIX}.${key.slice(PREFIX.length + 1)}`;
  }
  if (key.startsWith(`${PREFIX}_`)) {
    return `${LEGACY_PREFIX}_${key.slice(PREFIX.length + 1)}`;
  }
  return key;
}

function migrateKey(key: string): void {
  const legacyKey = toLegacyKey(key);
  if (legacyKey === key) return;
  const legacyValue = localStorage.getItem(legacyKey);
  if (legacyValue !== null && localStorage.getItem(key) === null) {
    localStorage.setItem(key, legacyValue);
    localStorage.removeItem(legacyKey);
  }
}

export const qamindStorage = {
  userOnboardingComplete: (userId: string) => `${PREFIX}.user.${userId}.onboardingComplete`,
  userRole: (userId: string) => `${PREFIX}.user.${userId}.role`,
  userTokens: (userId: string) => `${PREFIX}.user.${userId}.tokens`,
  userTokenDeductions: (userId: string) => `${PREFIX}.user.${userId}.tokenDeductions`,
  workspaceMeta: () => `${PREFIX}.workspace.meta`,
  workspaceMembers: () => `${PREFIX}.workspace.members`,
  pendingInvites: () => `${PREFIX}.pending_invites`,
  invitePending: (userId: string) => `${PREFIX}.invite_pending.${userId}`,
  onboardingComplete: () => `${PREFIX}_onboarding_complete`,
  onboardingCompleteUser: (userId: string) => `${PREFIX}_onboarding_complete.${userId}`,
  onboardingData: (userId: string) => `${PREFIX}_onboarding_data.${userId}`,

  get(key: string): string | null {
    migrateKey(key);
    return localStorage.getItem(key);
  },

  set(key: string, value: string): void {
    localStorage.setItem(key, value);
    const legacyKey = toLegacyKey(key);
    if (legacyKey !== key) localStorage.removeItem(legacyKey);
  },

  remove(key: string): void {
    localStorage.removeItem(key);
    localStorage.removeItem(toLegacyKey(key));
  },

  isUserRoleKey(key: string): boolean {
    return (
      (key.startsWith(`${PREFIX}.user.`) || key.startsWith(`${LEGACY_PREFIX}.user.`)) &&
      key.endsWith(".role")
    );
  },
};

export function isOnboardingCompleteLocally(userId: string | undefined): boolean {
  if (!userId || typeof window === "undefined") return false;
  return qamindStorage.get(qamindStorage.userOnboardingComplete(userId)) === "true";
}

export function markOnboardingComplete(
  userId: string | undefined,
  data?: Record<string, unknown>,
): void {
  qamindStorage.set(qamindStorage.onboardingComplete(), "true");
  if (!userId) return;
  qamindStorage.set(qamindStorage.onboardingCompleteUser(userId), "true");
  qamindStorage.set(qamindStorage.userOnboardingComplete(userId), "true");
  if (data) {
    qamindStorage.set(qamindStorage.onboardingData(userId), JSON.stringify(data));
  }
}

export function clearOnboardingData(userId: string): void {
  qamindStorage.remove(qamindStorage.onboardingComplete());
  qamindStorage.remove(qamindStorage.onboardingCompleteUser(userId));
  qamindStorage.remove(qamindStorage.userOnboardingComplete(userId));
  qamindStorage.remove(qamindStorage.onboardingData(userId));
}

export function clearUserSessionData(userId: string): void {
  clearOnboardingData(userId);
  qamindStorage.remove(qamindStorage.userTokens(userId));
  qamindStorage.remove(qamindStorage.userTokenDeductions(userId));
}

export function clearWorkspaceLocalData(userId: string): void {
  qamindStorage.remove(qamindStorage.workspaceMeta());
  qamindStorage.remove(qamindStorage.workspaceMembers());
  qamindStorage.remove(qamindStorage.userRole(userId));
  clearOnboardingData(userId);
}
