// @ts-nocheck
// SETUP REQUIRED:
// 1. Install Supabase CLI: npm install -g supabase
// 2. Login: supabase login
// 3. Link project: supabase link --project-ref xlrgteezusfeinbnzhq
// 4. Deploy function: supabase functions deploy delete-user
// 5. In Supabase Dashboard -> Settings -> Edge Functions, add secret:
//    SUPABASE_SERVICE_ROLE_KEY = (from Dashboard -> Settings -> API)
// 6. The function URL will be:
//    https://xlrgteezusfeinbnzhq.supabase.co/functions/v1/delete-user

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // 1. AUTHENTICATE THE REQUEST
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );

    const { data: userData, error: userError } = await userClient.auth.getUser();

    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid token or user not found" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = userData.user;

    // 2. CREATE SERVICE ROLE CLIENT
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 3. OWNERSHIP SAFETY CHECK
    const { data: ownedWorkspaces, error: workspacesError } = await adminClient
      .from("workspaces")
      .select("id, name")
      .eq("owner_id", user.id);

    if (workspacesError) {
      throw new Error(`Failed to check workspaces: ${workspacesError.message}`);
    }

    if (ownedWorkspaces && ownedWorkspaces.length > 0) {
      for (const workspace of ownedWorkspaces) {
        const { count, error: membersError } = await adminClient
          .from("workspace_members")
          .select("id", { count: "exact" })
          .eq("workspace_id", workspace.id)
          .eq("status", "active")
          .neq("user_id", user.id);

        if (membersError) {
          throw new Error(`Failed to check members for workspace ${workspace.id}: ${membersError.message}`);
        }

        if (count && count > 0) {
          return new Response(
            JSON.stringify({
              error: "transfer_ownership_required",
              workspace: workspace.name,
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }
    }

    // 4. DELETE USER DATA (Respect FK Constraints)
    // a. Delete workspace_members rows for this user
    const { error: delMembersErr } = await adminClient
      .from("workspace_members")
      .delete()
      .eq("user_id", user.id);

    if (delMembersErr) throw new Error(`Failed to delete workspace_members: ${delMembersErr.message}`);

    // b. Delete any solo workspaces they own
    const { error: delWorkspacesErr } = await adminClient
      .from("workspaces")
      .delete()
      .eq("owner_id", user.id);

    if (delWorkspacesErr) throw new Error(`Failed to delete workspaces: ${delWorkspacesErr.message}`);

    // c. Delete from public.users (Cascades to profiles automatically)
    const { error: delPublicUsersErr } = await adminClient
      .from("users")
      .delete()
      .eq("id", user.id);

    if (delPublicUsersErr) {
      // In a robust implementation, missing user here shouldn't fail the overall operation (Idempotency),
      // so we just log it if we want, but we can also just ignore if no rows were deleted.
      console.log(`Note: Deleting from public.users returned an issue or 0 rows. ${delPublicUsersErr.message}`);
    }

    // 5. DELETE THE AUTH ACCOUNT
    const { error: delAuthErr } = await adminClient.auth.admin.deleteUser(user.id);
    
    // Idempotency: if auth user doesn't exist anymore, deleteUser might fail. We should ignore it.
    if (delAuthErr && !delAuthErr.message.includes("User not found")) {
      throw new Error(`Failed to delete auth identity: ${delAuthErr.message}`);
    }

    // 6. RETURN SUCCESS
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
