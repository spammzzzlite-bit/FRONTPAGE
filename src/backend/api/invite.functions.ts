import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "../supabase-admin.server";
import { Resend } from "resend";

export type PendingInviteResult = {
  id: string;
  workspace_id: string;
  workspace_name: string;
  workspace_key: string;
  role: string;
  inviter_name: string;
  inviter_email: string;
};

function makeUserClient(token: string) {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Missing Supabase env vars");
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

async function verifyToken(accessToken: string) {
  const admin = getSupabaseAdmin();
  const { data: { user }, error } = await admin.auth.getUser(accessToken);
  if (error || !user) throw new Error("Unauthorized: invalid session.");
  return user;
}

export const getMyPendingInvites = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string() }))
  .handler(async ({ data }) => {
    await verifyToken(data.accessToken);
    const client = makeUserClient(data.accessToken);
    const { data: invites, error } = await client.rpc("get_my_pending_invites");
    if (error) throw new Error(error.message);
    return (invites ?? []) as PendingInviteResult[];
  });

export const acceptInvite = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string(), inviteId: z.string().uuid() }))
  .handler(async ({ data }) => {
    await verifyToken(data.accessToken);
    const client = makeUserClient(data.accessToken);
    const { data: result, error } = await client.rpc("accept_invite", {
      p_invite_id: data.inviteId,
    });
    if (error) throw new Error(error.message);
    if (!result?.ok) throw new Error(result?.error ?? "invite_not_found");
    return result as { ok: true; workspace_id: string; role: string };
  });

export type JoinInviteResult = {
  id: string;
  workspaceId: string;
  workspaceName: string;
  role: string;
};

export const verifyJoinInvite = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email(), workspaceKey: z.string() }))
  .handler(async ({ data }): Promise<JoinInviteResult | null> => {
    const admin = getSupabaseAdmin();
    const upperKey = data.workspaceKey.trim().toUpperCase();
    const lowerEmail = data.email.trim().toLowerCase();

    const { data: workspace } = await admin
      .from("workspaces")
      .select("id, name")
      .eq("workspace_key", upperKey)
      .maybeSingle();

    if (!workspace) return null;

    const { data: invites } = await admin
      .from("workspace_members")
      .select("id, role")
      .eq("workspace_id", workspace.id)
      .ilike("email", lowerEmail)
      .eq("status", "pending")
      .limit(1);

    const invite = invites?.[0] ?? null;
    if (!invite) return null;

    return {
      id: invite.id,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      role: invite.role,
    };
  });

export const declineInvite = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string(), inviteId: z.string().uuid() }))
  .handler(async ({ data }) => {
    await verifyToken(data.accessToken);
    const client = makeUserClient(data.accessToken);
    const { data: result, error } = await client.rpc("decline_invite", {
      p_invite_id: data.inviteId,
    });
    if (error) throw new Error(error.message);
    if (!result?.ok) throw new Error(result?.error ?? "invite_not_found");
    return { ok: true };
  });

export const sendInviteEmail = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string(),
      inviteeEmail: z.string().email(),
      inviterName: z.string(),
      workspaceName: z.string(),
      workspaceKey: z.string(),
      role: z.string(),
      appUrl: z.string().url(),
    })
  )
  .handler(async ({ data }) => {
    await verifyToken(data.accessToken);

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY not configured");

    const resend = new Resend(apiKey);
    const roleLabel = data.role.charAt(0).toUpperCase() + data.role.slice(1);
    const joinUrl = `${data.appUrl}/auth?mode=join`;

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0e0c0a;margin:0;padding:40px 16px;">
  <div style="max-width:480px;margin:0 auto;background:#1a1714;border:1px solid #2a2723;border-radius:12px;padding:40px;">
    <div style="margin-bottom:32px;">
      <span style="font-size:22px;font-weight:700;color:#f5f0eb;letter-spacing:-0.5px;">QAMind</span>
    </div>
    <h1 style="font-size:20px;font-weight:700;color:#f5f0eb;margin:0 0 8px;">You've been invited</h1>
    <p style="color:#8c8580;font-size:14px;margin:0 0 24px;line-height:1.6;">
      <strong style="color:#f5f0eb;">${data.inviterName}</strong> has invited you to join
      <strong style="color:#f5f0eb;">${data.workspaceName}</strong> as <strong style="color:#f5f0eb;">${roleLabel}</strong>.
    </p>
    <div style="background:#0e0c0a;border:1px solid #2a2723;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="color:#8c8580;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">Your Workspace Key</p>
      <p style="color:#f5a623;font-size:18px;font-weight:700;font-family:monospace;letter-spacing:0.05em;margin:0;">${data.workspaceKey}</p>
    </div>
    <p style="color:#8c8580;font-size:13px;margin:0 0 24px;line-height:1.6;">
      Click below to sign up and enter your workspace key when prompted.
    </p>
    <a href="${joinUrl}" style="display:block;background:#f5f0eb;color:#0e0c0a;text-decoration:none;border-radius:8px;padding:12px 24px;text-align:center;font-weight:600;font-size:14px;">Join ${data.workspaceName} →</a>
    <p style="color:#4a4744;font-size:12px;margin:24px 0 0;line-height:1.6;">
      If you weren't expecting this, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`;

    const { error } = await resend.emails.send({
      from: "QAMind <invites@qamind.ai>",
      to: data.inviteeEmail,
      subject: `You've been invited to ${data.workspaceName} on QAMind`,
      html,
    });

    if (error) throw new Error(error.message);
    return { ok: true };
  });
