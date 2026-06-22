import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase-admin.server";

/**
 * Deletes the calling user's account and all owned data.
 *
 * Deletion order (respects FK constraints in SUPABASE_SETUP.sql):
 * 1. Delete owned workspaces → CASCADE removes projects, test_suites, test_cases,
 *    test_runs, test_run_results, bugs, sprints, project_files inside them.
 * 2. admin.auth.deleteUser → CASCADE removes workspace_members and profiles.
 *
 * Blocked if the user owns a workspace that has other active members (they must
 * transfer ownership first).
 */
export const deleteOwnAccount = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string() }))
  .handler(async ({ data }) => {
    const admin = getSupabaseAdmin();

    // 1. Verify the caller's token and get user id
    const {
      data: { user },
      error: authError,
    } = await admin.auth.getUser(data.accessToken);

    if (authError || !user) {
      throw new Error("Unauthorized: invalid session.");
    }

    const userId = user.id;

    // 2. Safety check: block if user owns a workspace with other active members
    const { data: ownedWorkspaces, error: wsErr } = await admin
      .from("workspaces")
      .select("id, name")
      .eq("owner_id", userId);

    if (wsErr) throw new Error(`Failed to check workspaces: ${wsErr.message}`);

    for (const ws of ownedWorkspaces ?? []) {
      const { count, error: countErr } = await admin
        .from("workspace_members")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", ws.id)
        .eq("status", "active")
        .neq("user_id", userId);

      if (countErr) throw new Error(`Failed to check members: ${countErr.message}`);

      if (count && count > 0) {
        throw new Error(`transfer_ownership_required:${ws.name}`);
      }
    }

    // 3. Delete owned workspaces (CASCADE wipes all workspace data)
    if (ownedWorkspaces && ownedWorkspaces.length > 0) {
      const { error: delWsErr } = await admin
        .from("workspaces")
        .delete()
        .eq("owner_id", userId);

      if (delWsErr) throw new Error(`Failed to delete workspaces: ${delWsErr.message}`);
    }

    // 4. Delete auth user → CASCADE deletes workspace_members + profiles
    const { error: delAuthErr } = await admin.auth.admin.deleteUser(userId);

    if (delAuthErr && !delAuthErr.message.includes("User not found")) {
      throw new Error(`Failed to delete auth account: ${delAuthErr.message}`);
    }

    return { success: true };
  });

export const leaveWorkspace = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string(), workspaceId: z.string() }))
  .handler(async ({ data }) => {
    const admin = getSupabaseAdmin();

    const { data: { user }, error: authError } = await admin.auth.getUser(data.accessToken);
    if (authError || !user) throw new Error("Unauthorized: invalid session.");

    const { data: member, error: memberErr } = await admin
      .from("workspace_members")
      .select("id, role")
      .eq("workspace_id", data.workspaceId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (memberErr || !member) throw new Error("not_a_member");
    if (member.role === "owner") throw new Error("owner_cannot_leave");

    const { error: delErr } = await admin
      .from("workspace_members")
      .delete()
      .eq("id", member.id);

    if (delErr) throw new Error(`Failed to leave workspace: ${delErr.message}`);

    return { success: true };
  });

export const transferOwnership = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string(), workspaceId: z.string(), newOwnerId: z.string() }))
  .handler(async ({ data }) => {
    const admin = getSupabaseAdmin();

    const { data: { user }, error: authError } = await admin.auth.getUser(data.accessToken);
    if (authError || !user) throw new Error("Unauthorized: invalid session.");

    const { data: ws, error: wsErr } = await admin
      .from("workspaces")
      .select("id, name")
      .eq("id", data.workspaceId)
      .eq("owner_id", user.id)
      .single();

    if (wsErr || !ws) throw new Error("not_owner");

    const { data: newOwnerMember, error: memberErr } = await admin
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", data.workspaceId)
      .eq("user_id", data.newOwnerId)
      .eq("status", "active")
      .single();

    if (memberErr || !newOwnerMember) throw new Error("target_not_member");

    await admin.from("workspaces").update({ owner_id: data.newOwnerId }).eq("id", data.workspaceId);
    await admin.from("workspace_members").update({ role: "admin" }).eq("workspace_id", data.workspaceId).eq("user_id", user.id);
    await admin.from("workspace_members").update({ role: "owner" }).eq("workspace_id", data.workspaceId).eq("user_id", data.newOwnerId);

    return { success: true, workspaceName: ws.name };
  });
