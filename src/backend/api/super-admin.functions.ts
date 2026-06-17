import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "../supabase-admin.server";

// Helper function to calculate SHA-256 hash
function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

// Helper to verify the user session and check if they are in the super_admins whitelist
async function verifySuperAdminSession(accessToken: string) {
  const adminClient = getSupabaseAdmin();

  // 1. Verify access token signature and retrieve user info
  const {
    data: { user },
    error: authError,
  } = await adminClient.auth.getUser(accessToken);
  if (authError || !user || !user.email) {
    throw new Error("Unauthorized: Invalid user session.");
  }

  // 2. Query super_admins table to see if user's email is whitelisted
  const { data: adminRecord, error: dbError } = await adminClient
    .from("super_admins")
    .select("email")
    .eq("email", user.email)
    .single();

  if (dbError || !adminRecord) {
    throw new Error("Unauthorized: Access denied. Email is not whitelisted as Super Admin.");
  }

  return { email: user.email, userId: user.id };
}

/**
 * Checks if the user is a whitelisted Super Admin.
 */
export const checkSuperAdminStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string() }))
  .handler(async ({ data }) => {
    try {
      const { email } = await verifySuperAdminSession(data.accessToken);
      return { isSuperAdmin: true, email };
    } catch {
      return { isSuperAdmin: false, email: "" };
    }
  });

/**
 * Verifies the Super Admin Master Password.
 */
export const verifySuperAdminCredentials = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string(),
      email: z.string().email(),
      passwordPlain: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const adminClient = getSupabaseAdmin();

    // 1. Verify user session matches email and is whitelisted
    const session = await verifySuperAdminSession(data.accessToken);
    if (session.email !== data.email) {
      return { success: false, error: "Authenticated user email mismatch." };
    }

    // 2. Fetch the stored master password hash from public.super_admin_config
    const { data: configRecord, error } = await adminClient
      .from("super_admin_config")
      .select("value")
      .eq("key", "master_password_hash")
      .single();

    if (error || !configRecord) {
      return {
        success: false,
        error: "Super Admin Master Password configuration not found in database.",
      };
    }

    // 3. Compute SHA-256 hash of input password and compare
    const computedHash = sha256(data.passwordPlain);
    if (computedHash === configRecord.value) {
      return { success: true };
    }

    return { success: false, error: "Invalid master password." };
  });

/**
 * Fetches all platform data bypassing RLS using the admin client.
 */
export const getGlobalAdminData = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string() }))
  .handler(async ({ data }) => {
    await verifySuperAdminSession(data.accessToken);
    const adminClient = getSupabaseAdmin();

    // Fetch all relevant tables in parallel
    const [
      { data: projects },
      { data: testPlans },
      { data: suites },
      { data: bugs },
      { data: users },
      { data: sprints },
      { data: admins },
    ] = await Promise.all([
      adminClient.from("projects").select("*").order("created_at", { ascending: false }),
      adminClient.from("test_plans").select("*").order("created_at", { ascending: false }),
      adminClient.from("suites").select("*").order("created_at", { ascending: false }),
      adminClient.from("bugs").select("*").order("created_at", { ascending: false }),
      adminClient
        .from("users")
        .select("id, name, email, picture, created_at")
        .order("created_at", { ascending: false }),
      adminClient.from("sprints").select("*").order("created_at", { ascending: false }),
      adminClient.from("super_admins").select("*").order("created_at", { ascending: true }),
    ]);

    return {
      projects: projects || [],
      testPlans: testPlans || [],
      suites: suites || [],
      bugs: bugs || [],
      users: users || [],
      sprints: sprints || [],
      superAdmins: admins || [],
    };
  });

/**
 * Performs database CRUD operations directly on behalf of Super Admin.
 */
export const mutateGlobalEntity = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string(),
      table: z.enum(["projects", "test_plans", "suites", "bugs"]),
      action: z.enum(["insert", "update", "delete"]),
      id: z.string().optional(),
      data: z.any().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await verifySuperAdminSession(data.accessToken);
    const adminClient = getSupabaseAdmin();

    const { table, action, id, data: entityData } = data;

    try {
      if (action === "insert") {
        const { data: res, error } = await adminClient
          .from(table)
          .insert(entityData)
          .select()
          .single();
        if (error) throw error;
        return { success: true, data: res };
      } else if (action === "update") {
        if (!id) throw new Error("Entity ID is required for update action.");
        const { data: res, error } = await adminClient
          .from(table)
          .update(entityData)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return { success: true, data: res };
      } else if (action === "delete") {
        if (!id) throw new Error("Entity ID is required for delete action.");
        const { error } = await adminClient.from(table).delete().eq("id", id);
        if (error) throw error;
        return { success: true };
      }
      return { success: false, error: "Invalid action." };
    } catch (err: any) {
      console.error(`Error mutating table ${table} under action ${action}:`, err);
      return { success: false, error: err.message || String(err) };
    }
  });

/**
 * Overrides members and leads for projects and sprints manually.
 */
export const updateProjectRoles = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string(),
      targetType: z.enum(["project", "sprint"]),
      targetId: z.string().uuid(),
      leadId: z.string().uuid().nullable(),
      members: z.array(z.string().uuid()),
      developers: z.array(z.string().uuid()).optional(),
      testers: z.array(z.string().uuid()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await verifySuperAdminSession(data.accessToken);
    const adminClient = getSupabaseAdmin();

    const { targetType, targetId, leadId, members, developers = [], testers = [] } = data;

    try {
      if (targetType === "project") {
        const { error } = await adminClient
          .from("projects")
          .update({
            team_lead_id: leadId,
            team_members: members,
          })
          .eq("id", targetId);
        if (error) throw error;
      } else if (targetType === "sprint") {
        const { error } = await adminClient
          .from("sprints")
          .update({
            sprint_lead_id: leadId,
            sprint_members: members,
            sprint_developers: developers,
            sprint_testers: testers,
          })
          .eq("id", targetId);
        if (error) throw error;
      }
      return { success: true };
    } catch (err: any) {
      console.error(`Error updating project/sprint roles for ID ${targetId}:`, err);
      return { success: false, error: err.message || String(err) };
    }
  });

/**
 * Adds a new Super Admin email address to the whitelist.
 */
export const whitelistSuperAdmin = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string(),
      email: z.string().email(),
    }),
  )
  .handler(async ({ data }) => {
    await verifySuperAdminSession(data.accessToken);
    const adminClient = getSupabaseAdmin();

    const { error } = await adminClient.from("super_admins").insert({ email: data.email });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  });

/**
 * Removes a Super Admin email address from the whitelist.
 */
export const removeSuperAdminFromWhitelist = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string(),
      email: z.string().email(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await verifySuperAdminSession(data.accessToken);
    if (session.email === data.email) {
      return { success: false, error: "You cannot remove yourself from the whitelist." };
    }

    const adminClient = getSupabaseAdmin();
    const { error } = await adminClient.from("super_admins").delete().eq("email", data.email);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  });

/**
 * Fetches any active/pending password reset request.
 */
export const getActivePasswordResetRequest = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string() }))
  .handler(async ({ data }) => {
    await verifySuperAdminSession(data.accessToken);
    const adminClient = getSupabaseAdmin();

    const { data: requestData, error } = await adminClient
      .from("password_reset_requests")
      .select("*")
      .eq("is_executed", false)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (error) {
      console.error("Error fetching password reset requests:", error);
      return { request: null };
    }
    return { request: requestData };
  });

/**
 * Initiates a new multi-sig password reset request.
 */
export const createPasswordResetRequest = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string(),
      newPasswordPlain: z.string().min(6),
    }),
  )
  .handler(async ({ data }) => {
    const session = await verifySuperAdminSession(data.accessToken);
    const adminClient = getSupabaseAdmin();

    // Check if there is already an active pending request
    const { data: existing } = await adminClient
      .from("password_reset_requests")
      .select("id")
      .eq("is_executed", false)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "There is already a pending password reset request." };
    }

    const newHash = sha256(data.newPasswordPlain);

    // Get total whitelisted admins
    const { data: admins } = await adminClient.from("super_admins").select("email");
    const totalAdminsCount = admins?.length || 1;

    // Create the request, with the creator as the first approval
    const approvals = [session.email];
    const isExecuted = approvals.length >= totalAdminsCount;

    const { data: newRequest, error } = await adminClient
      .from("password_reset_requests")
      .insert({
        requested_by: session.email,
        new_password_hash: newHash,
        approvals,
        is_executed: isExecuted,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (isExecuted) {
      // 100% consensus reached immediately (only 1 super admin registered)
      const { error: configError } = await adminClient
        .from("super_admin_config")
        .update({ value: newHash })
        .eq("key", "master_password_hash");

      if (configError) {
        return {
          success: false,
          error: `Consensus met, but failed to write to config: ${configError.message}`,
        };
      }
      return { success: true, isExecuted: true, data: newRequest };
    }

    return { success: true, isExecuted: false, data: newRequest };
  });

/**
 * Approves a pending password reset request (Multi-Sig consensus).
 */
export const approvePasswordResetRequest = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string(),
      requestId: z.string().uuid(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await verifySuperAdminSession(data.accessToken);
    const adminClient = getSupabaseAdmin();

    // 1. Fetch active request
    const { data: request, error: fetchError } = await adminClient
      .from("password_reset_requests")
      .select("*")
      .eq("id", data.requestId)
      .single();

    if (fetchError || !request) {
      return { success: false, error: "Password reset request not found." };
    }

    if (request.is_executed) {
      return { success: false, error: "This request has already been executed." };
    }

    // 2. Add email to approvals array if not already present
    const currentApprovals: string[] = Array.isArray(request.approvals) ? request.approvals : [];
    if (currentApprovals.includes(session.email)) {
      return { success: false, error: "You have already approved this request." };
    }

    const updatedApprovals = [...currentApprovals, session.email];

    // 3. Count total super admins whitelisted
    const { data: admins } = await adminClient.from("super_admins").select("email");
    const totalAdmins = admins?.map((a) => a.email) || [];
    const totalAdminsCount = totalAdmins.length;

    // Filter approvals to only include currently active whitelisted admins
    const activeApprovals = updatedApprovals.filter((email) => totalAdmins.includes(email));

    // Consensus checks if active approvals cover ALL whitelisted admins (100% consensus)
    const isExecuted = activeApprovals.length >= totalAdminsCount;

    // 4. Update request row
    const { error: updateRequestError } = await adminClient
      .from("password_reset_requests")
      .update({
        approvals: activeApprovals,
        is_executed: isExecuted,
      })
      .eq("id", data.requestId);

    if (updateRequestError) {
      return { success: false, error: updateRequestError.message };
    }

    if (isExecuted) {
      // 100% consensus achieved, write new password hash to config
      const { error: configError } = await adminClient
        .from("super_admin_config")
        .update({ value: request.new_password_hash })
        .eq("key", "master_password_hash");

      if (configError) {
        return {
          success: false,
          error: `Consensus achieved, but config write failed: ${configError.message}`,
        };
      }
      return { success: true, isExecuted: true };
    }

    return { success: true, isExecuted: false };
  });
