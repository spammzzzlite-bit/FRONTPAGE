import React from "react";
import { Users, ArrowRight } from "lucide-react";

export interface PendingInvite {
  id: string;
  workspace_id: string;
  workspace_name: string;
  workspace_key: string;
  role: string;
  inviter_name: string;
  inviter_email: string;
}

interface PendingInvitesModalProps {
  invites: PendingInvite[];
  onJoin: (invite: PendingInvite) => Promise<void>;
  onDecline: (invite: PendingInvite) => Promise<void>;
  onCreateOwn: () => void;
  onMaybeLater: () => void;
  isLoading?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export function PendingInvitesModal({
  invites,
  onJoin,
  onDecline,
  onCreateOwn,
  onMaybeLater,
  isLoading,
}: PendingInvitesModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(26,23,20,0.8)] p-4 backdrop-blur-md">
      <div className="w-full max-w-md animate-[fade-in-up_0.3s_ease-out_both] rounded-[16px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-8 shadow-[var(--shadow-xl)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--c-accent)]/10 text-[var(--c-accent)] ring-1 ring-[var(--c-accent)]/20">
            <Users className="h-7 w-7" />
          </div>
          <h2 className="font-display text-[28px] leading-tight text-[var(--c-text)]">
            You've been invited
          </h2>
          <p className="mt-2 text-[14px] text-[var(--c-text-muted)]">
            You have pending invitations to join the following workspaces.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3">
          {invites.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-col gap-3 rounded-[12px] border border-[var(--c-border)] bg-[var(--c-bg-base)] p-4 transition-colors hover:border-[var(--c-border-strong)]"
            >
              <div className="min-w-0">
                <p className="truncate font-display text-[16px] text-[var(--c-text)]">
                  {inv.workspace_name}
                </p>
                <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-[var(--c-text-muted)]">
                  {ROLE_LABELS[inv.role] ?? inv.role} · Invited by {inv.inviter_name}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onJoin(inv)}
                  disabled={isLoading}
                  className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-[8px] bg-[var(--c-accent)] px-4 py-2 font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                >
                  Join
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => onDecline(inv)}
                  disabled={isLoading}
                  className="flex-1 rounded-[8px] border border-[var(--c-border)] px-4 py-2 text-sm text-[var(--c-text-muted)] transition-colors hover:border-[var(--c-border-strong)] hover:text-[var(--c-text)] disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex w-full items-center gap-3">
            <div className="h-[1px] flex-1 bg-[var(--c-border)]"></div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--c-text-muted)]">
              OR
            </span>
            <div className="h-[1px] flex-1 bg-[var(--c-border)]"></div>
          </div>

          <button
            onClick={onMaybeLater}
            disabled={isLoading}
            className="text-[13px] font-medium text-[var(--c-text-muted)] underline-offset-4 transition-colors hover:text-[var(--c-text)] hover:underline disabled:opacity-50"
          >
            Decide later
          </button>

          <button
            onClick={onCreateOwn}
            disabled={isLoading}
            className="text-[13px] font-medium text-[var(--c-text-muted)] underline-offset-4 transition-colors hover:text-[var(--c-text)] hover:underline disabled:opacity-50"
          >
            Create my own workspace instead
          </button>
        </div>
      </div>
    </div>
  );
}
