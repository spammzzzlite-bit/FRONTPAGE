import { createStore } from "./store";
import type { RecordingSession } from "./types/recording";
import { persistRecordingSession, syncRecordingSession, deleteRecordingFromSupabase } from "./recordings-sync";

// Workspace-scoped cache; source of truth is Supabase recording_sessions
export const recordingsStore = createStore<RecordingSession[]>("ai-test-gen.recordings", []);
export const useRecordings = recordingsStore.useStore;

/**
 * Add a new recording session to the inbox
 */
export function addRecording(
  session: Omit<RecordingSession, "id" | "status" | "generatedTestCaseIds" | "tags">,
): RecordingSession {
  const newSession: RecordingSession = {
    ...session,
    id: `REC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    status: "pending",
    generatedTestCaseIds: [],
    tags: [],
  };
  recordingsStore.set((prev) => [newSession, ...prev]);
  void persistRecordingSession(newSession);
  return newSession;
}

/**
 * Update the status of a recording session
 */
export function updateRecordingStatus(id: string, status: RecordingSession["status"]) {
  recordingsStore.set((prev) =>
    prev.map((r) => {
      if (r.id !== id) return r;
      const updated = { ...r, status };
      void syncRecordingSession(updated);
      return updated;
    }),
  );
}

/**
 * Link generated test cases to a recording session
 */
export function linkTestCasesToRecording(recordingId: string, testCaseIds: string[]) {
  recordingsStore.set((prev) =>
    prev.map((r) => {
      if (r.id !== recordingId) return r;
      const updated = {
        ...r,
        generatedTestCaseIds: [...new Set([...r.generatedTestCaseIds, ...testCaseIds])],
        status: "converted" as const,
      };
      void syncRecordingSession(updated);
      return updated;
    }),
  );
}

/**
 * Delete a recording session
 */
export function deleteRecording(id: string) {
  recordingsStore.set((prev) => prev.filter((r) => r.id !== id));
  void deleteRecordingFromSupabase(id);
}
