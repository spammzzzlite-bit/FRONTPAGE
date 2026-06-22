import { supabase } from "@/backend/supabase";
import { getActiveWorkspaceMeta, getCurrentUserId } from "./store";
import { recordingsStore } from "./recordingsStore";
import type { RecordingSession } from "./types/recording";

function rowToSession(row: Record<string, unknown>): RecordingSession {
  return {
    id: String(row.id),
    projectId: String(row.project_id || ""),
    sessionName: String(row.session_name || "Recording"),
    url: String(row.url || ""),
    viewport: (row.viewport as RecordingSession["viewport"]) || { width: 0, height: 0 },
    events: (row.events as RecordingSession["events"]) || [],
    startedAt: row.started_at ? new Date(String(row.started_at)).getTime() : Date.now(),
    endedAt: row.ended_at ? new Date(String(row.ended_at)).getTime() : Date.now(),
    duration: Number(row.duration_ms || 0),
    status: (row.status as RecordingSession["status"]) || "pending",
    generatedTestCaseIds: (row.generated_test_case_ids as string[]) || [],
    generatedScenarioId: row.generated_scenario_id
      ? String(row.generated_scenario_id)
      : undefined,
    browserInfo: (row.browser_info as RecordingSession["browserInfo"]) || {
      name: "Chrome",
      version: "",
      os: "",
    },
    recordedBy: row.recorded_by ? String(row.recorded_by) : undefined,
    tags: (row.tags as string[]) || [],
    module: row.module ? String(row.module) : undefined,
    projectName: row.project_name ? String(row.project_name) : undefined,
    aiReadyRecording: row.ai_ready_recording,
    rawRecording: row.raw_recording,
  };
}

function sessionToRow(session: RecordingSession, workspaceId: string, userId: string | null) {
  return {
    id: session.id,
    workspace_id: workspaceId,
    project_id: session.projectId || null,
    user_id: userId,
    session_name: session.sessionName,
    url: session.url,
    status: session.status,
    duration_ms: session.duration,
    started_at: new Date(session.startedAt).toISOString(),
    ended_at: new Date(session.endedAt).toISOString(),
    events: session.events,
    viewport: session.viewport,
    browser_info: session.browserInfo,
    recorded_by: session.recordedBy || null,
    module: session.module || null,
    project_name: session.projectName || null,
    tags: session.tags,
    generated_test_case_ids: session.generatedTestCaseIds,
    generated_scenario_id: session.generatedScenarioId || null,
    ai_ready_recording: session.aiReadyRecording ?? null,
    raw_recording: session.rawRecording ?? null,
    updated_at: new Date().toISOString(),
  };
}

export async function loadRecordingsFromSupabase(workspaceId?: string): Promise<void> {
  const wsId = workspaceId || getActiveWorkspaceMeta()?.workspaceId;
  if (!wsId) return;

  const { data, error } = await supabase
    .from("recording_sessions")
    .select("*")
    .eq("workspace_id", wsId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      console.warn("recording_sessions table not found — run scripts/add-recording-sessions.sql");
      return;
    }
    console.error("Failed to load recordings:", error);
    return;
  }

  const remote = (data || []).map((row) => rowToSession(row as Record<string, unknown>));
  const local = recordingsStore.get();
  const byId = new Map<string, RecordingSession>();

  for (const session of local) byId.set(session.id, session);
  for (const session of remote) {
    const existing = byId.get(session.id);
    if (!existing || session.endedAt >= existing.endedAt) {
      byId.set(session.id, session);
    }
  }

  const merged = Array.from(byId.values()).sort((a, b) => b.startedAt - a.startedAt);
  recordingsStore.set(merged);

  // Backfill any local-only sessions to Supabase
  const remoteIds = new Set(remote.map((s) => s.id));
  for (const session of merged) {
    if (!remoteIds.has(session.id)) {
      void persistRecordingSession(session);
    }
  }
}

export async function persistRecordingSession(session: RecordingSession): Promise<void> {
  const workspaceId = getActiveWorkspaceMeta()?.workspaceId;
  if (!workspaceId) {
    console.warn("Recording saved locally only — workspace not ready yet.");
    return;
  }

  const userId = getCurrentUserId();
  const { error } = await supabase
    .from("recording_sessions")
    .upsert(sessionToRow(session, workspaceId, userId), { onConflict: "id" });

  if (error) {
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      console.warn("recording_sessions table not found — run scripts/add-recording-sessions.sql");
      return;
    }
    console.error("Failed to persist recording:", error);
  }
}

export async function syncRecordingSession(session: RecordingSession): Promise<void> {
  await persistRecordingSession(session);
}

export async function deleteRecordingFromSupabase(id: string): Promise<void> {
  const workspaceId = getActiveWorkspaceMeta()?.workspaceId;
  if (!workspaceId) return;

  const { error } = await supabase
    .from("recording_sessions")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) console.error("Failed to delete recording:", error);
}
