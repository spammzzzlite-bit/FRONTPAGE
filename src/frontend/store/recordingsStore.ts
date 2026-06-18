import { createStore } from "./store";
import type { RecordingSession } from "./types/recording";

// Store for incoming recording sessions from the Chrome extension
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
  return newSession;
}

/**
 * Update the status of a recording session
 */
export function updateRecordingStatus(id: string, status: RecordingSession["status"]) {
  recordingsStore.set((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
}

/**
 * Link generated test cases to a recording session
 */
export function linkTestCasesToRecording(recordingId: string, testCaseIds: string[]) {
  recordingsStore.set((prev) =>
    prev.map((r) =>
      r.id === recordingId
        ? {
            ...r,
            generatedTestCaseIds: [...new Set([...r.generatedTestCaseIds, ...testCaseIds])],
            status: "converted",
          }
        : r,
    ),
  );
}

/**
 * Delete a recording session
 */
export function deleteRecording(id: string) {
  recordingsStore.set((prev) => prev.filter((r) => r.id !== id));
}
