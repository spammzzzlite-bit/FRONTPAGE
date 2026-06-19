import { supabase } from "@/backend/supabase";
import { generateWorkspaceKey } from "@/lib/workspace-key";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * Server-side repair via Supabase RPC (SECURITY DEFINER).
 * Upgrades mistaken Viewer rows, claims sole-member workspaces, and provisions new ones.
 */
export async function ensureUserWorkspaceAccess(): Promise<boolean> {
  const { data, error } = await supabase.rpc("ensure_user_workspace_access");
  if (error) {
    if (error.code !== "PGRST202" && !error.message?.includes("does not exist")) {
      console.warn("ensure_user_workspace_access RPC:", error.message);
    }
    return false;
  }
  return !!(data as { ok?: boolean } | null)?.ok;
}

/**
 * Creates a workspace + owner membership for a user with no active membership.
 */
export async function provisionWorkspaceForNewUser(
  userId: string,
  userEmail: string,
  userName: string,
  preferredWorkspaceId?: string,
): Promise<string | null> {
  if (!userId || !userEmail) return null;

  const { data: existingActiveByUid } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1);

  if (existingActiveByUid?.length) return null;

  const { data: existingActiveByEmail } = await supabase
    .from("workspace_members")
    .select("id")
    .ilike("email", userEmail)
    .eq("status", "active")
    .limit(1);

  if (existingActiveByEmail?.length) return null;

  const workspaceId =
    preferredWorkspaceId && isValidUuid(preferredWorkspaceId)
      ? preferredWorkspaceId
      : crypto.randomUUID();

  const { error: wsError } = await supabase.from("workspaces").insert({
    id: workspaceId,
    name: "My Workspace",
    workspace_key: generateWorkspaceKey(),
    owner_id: userId,
    owner_email: userEmail,
  });

  if (wsError) {
    console.error("Failed to create workspace for new user:", wsError);
    return null;
  }

  const { error: memberError } = await supabase.from("workspace_members").insert({
    workspace_id: workspaceId,
    user_id: userId,
    email: userEmail,
    display_name: userName || userEmail.split("@")[0] || "Workspace Owner",
    role: "owner",
    status: "active",
  });

  if (memberError) {
    console.error("Failed to create owner membership for new user:", memberError);
    return null;
  }

  return workspaceId;
}
