import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Video,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  MousePointer2,
  Keyboard,
  Globe,
  Camera,
  Network,
  TestTube,
  Sparkles,
  Search,
} from "lucide-react";
import { useRecordings, deleteRecording, updateRecordingStatus } from "@/frontend/store/recordingsStore";
import { useProjects } from "@/frontend/store/store";
import { PageHeader } from "./_app.projects";
import { EmptyState } from "@/frontend/components/EmptyState";
import { usePanel } from "@/frontend/components/PanelContext";
import { toast } from "./_app";
import type { RecordingSession, RecordingEvent } from "@/frontend/store/types/recording";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/recordings")({
  component: RecordingsPage,
});

function RecordingsPage() {
  const [recordings] = useRecordings();
  const [projects] = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const { openPanel } = usePanel();
  const navigate = useNavigate();

  const filteredRecordings = recordings.filter((r) =>
    r.sessionName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        section="§ Recordings"
        title="Session Inbox"
        subtitle="Incoming browser recordings from the Chrome extension, ready for AI test generation."
        action={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--c-text-muted)]" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-full border border-[var(--c-border)] bg-[var(--c-bg-input)] py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-[var(--c-accent)] focus:shadow-[0_0_0_3px_var(--c-accent-soft)]"
            />
          </div>
        }
      />

      {recordings.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No recordings yet"
          body="Install and connect the Chrome extension to start receiving browser recording sessions here."
          cta={{ label: "View Extension Docs", onClick: () => alert("Docs coming soon!") }}
        />
      ) : (
        <div className="mt-8 space-y-4">
          {filteredRecordings.map((recording) => {
            const project = projects.find((p) => p.id === recording.projectId);
            return (
              <div
                key={recording.id}
                onClick={() =>
                  openPanel(<RecordingPanel recording={recording} />, [
                    { label: "Recordings" },
                    { label: recording.sessionName },
                  ])
                }
                className="group flex cursor-pointer items-center justify-between rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-card)] p-4 transition-all hover:-translate-y-[2px] hover:border-[var(--c-border-strong)] hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--c-bg-hover)] text-[var(--c-text-muted)]">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--c-text)]">{recording.sessionName}</h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-[var(--c-text-muted)]">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" /> {new URL(recording.url).hostname}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {(recording.duration / 1000).toFixed(1)}s
                      </span>
                      <span>{recording.events.length} events</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block">
                    <span className="rounded-sm bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {project?.name || "Unknown Project"}
                    </span>
                  </div>
                  <StatusBadge status={recording.status} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate({ to: "/generate" });
                      toast("Pass the recording ID to the generator (coming soon)");
                    }}
                    className="opacity-0 group-hover:opacity-100 rounded-md bg-[var(--c-accent)] px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-[var(--c-accent-dark)]"
                  >
                    Generate Tests
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: RecordingSession["status"] }) {
  const styles = {
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    converted: "bg-green-500/10 text-green-500 border-green-500/20",
    failed: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
}

function RecordingPanel({ recording }: { recording: RecordingSession }) {
  const { closePanel } = usePanel();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--c-accent-soft)] text-[var(--c-accent)]">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-[var(--c-text)]">{recording.sessionName}</h2>
            <p className="font-mono text-[11px] text-[var(--c-text-muted)] mt-1">{recording.id}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-hover)] p-4 sm:grid-cols-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--c-text-muted)]">Status</p>
            <div className="mt-1"><StatusBadge status={recording.status} /></div>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--c-text-muted)]">Duration</p>
            <p className="mt-1 text-sm font-medium text-[var(--c-text)]">{(recording.duration / 1000).toFixed(1)}s</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--c-text-muted)]">Events</p>
            <p className="mt-1 text-sm font-medium text-[var(--c-text)]">{recording.events.length}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--c-text-muted)]">Browser</p>
            <p className="mt-1 text-sm font-medium text-[var(--c-text)]">{recording.browserInfo.name} {recording.browserInfo.version}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-[var(--c-text)]">Event Timeline</h3>
          <button
            onClick={() => {
              navigate({ to: "/generate" });
              closePanel();
            }}
            className="flex items-center gap-2 rounded-md bg-[var(--c-accent)] px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-[var(--c-accent-dark)]"
          >
            <Sparkles className="h-3.5 w-3.5" /> Convert to Test Cases
          </button>
        </div>

        <div className="relative space-y-4 before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-[var(--c-border)]">
          {recording.events.map((event, i) => (
            <div key={i} className="relative flex gap-4 pl-12">
              <div className="absolute left-1.5 top-1 flex h-5 w-5 items-center justify-center rounded-full border-[2px] border-[var(--c-bg-card)] bg-[var(--c-bg-hover)] text-[var(--c-text-muted)]">
                <EventIcon type={event.type} />
              </div>
              <div className="flex-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-bg-card)] p-3 text-sm">
                <div className="flex items-start justify-between">
                  <p className="font-medium capitalize text-[var(--c-text)]">{event.type} Event</p>
                  <span className="font-mono text-[10px] text-[var(--c-text-muted)]">+{event.timestamp}ms</span>
                </div>
                {event.target && (
                  <div className="mt-2 rounded bg-[var(--c-bg-hover)] p-2 font-mono text-[11px] text-[var(--c-text-muted)] break-all">
                    {event.target.cssSelector}
                  </div>
                )}
                {event.value && (
                  <p className="mt-2 text-sm text-[var(--c-text)]">
                    Typed: <span className="font-mono bg-[var(--c-bg-hover)] px-1 py-0.5 rounded">"{event.value}"</span>
                  </p>
                )}
                {event.url && (
                  <p className="mt-2 text-sm text-[var(--c-text)] truncate text-blue-500 hover:underline cursor-pointer">
                    {event.url}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventIcon({ type }: { type: RecordingEvent["type"] }) {
  switch (type) {
    case "click": return <MousePointer2 className="h-2.5 w-2.5" />;
    case "input": return <Keyboard className="h-2.5 w-2.5" />;
    case "navigate": return <Globe className="h-2.5 w-2.5" />;
    case "screenshot": return <Camera className="h-2.5 w-2.5" />;
    case "network": return <Network className="h-2.5 w-2.5" />;
    case "assert": return <TestTube className="h-2.5 w-2.5" />;
    default: return <PlayCircle className="h-2.5 w-2.5" />;
  }
}
