import React, { ReactNode, useState, useEffect } from "react";
import { useUserStore, useTokens, useCurrentRole } from "@/frontend/store/store";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/frontend/components/ui/tooltip";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { qamindStorage } from "@/lib/storage-keys";

export type UserRole = "owner" | "admin" | "editor" | "viewer";

export const PERMISSIONS: Record<string, UserRole[]> = {
  "project:create": ["owner", "admin", "editor"],
  "project:edit": ["owner", "admin"],
  "project:delete": ["owner"],
  "suite:create": ["owner", "admin", "editor"],
  "suite:delete": ["owner", "admin"],
  "tests:generate": ["owner", "admin", "editor"],
  "tests:save": ["owner", "admin", "editor"],
  "tests:run": ["owner", "admin", "editor"],
  "tests:view": ["owner", "admin", "editor", "viewer"],
  "runs:view": ["owner", "admin", "editor", "viewer"],
  "bugs:log": ["owner", "admin", "editor"],
  "bugs:view": ["owner", "admin", "editor", "viewer"],
  "integrations:toggle": ["owner", "admin"],
  "integrations:configure": ["owner", "admin"],
  "recordings:create": ["owner", "admin", "editor"],
  "plans:create": ["owner", "admin", "editor"],
  "plans:view": ["owner", "admin", "editor", "viewer"],
  "specs:upload": ["owner", "admin", "editor"],
  "reports:view": ["owner", "admin", "editor", "viewer"],
  "analytics:view": ["owner", "admin", "editor", "viewer"],
  "members:add": ["owner", "admin"],
  "members:edit": ["owner", "admin"],
  "members:remove": ["owner", "admin"],
  "settings:edit": ["owner", "admin", "editor", "viewer"],
  "settings:plan": ["owner"],
  "settings:delete_own_account": ["owner", "admin", "editor", "viewer"],
  "settings:delete_workspace": ["owner"],
  "workspace:viewKey": ["owner"],
  "superadmin:access": ["owner"],
};

export function can(role: UserRole, action: string): boolean {
  return (PERMISSIONS[action] ?? []).includes(role);
}

export function getStoredRole(): UserRole {
  if (typeof window === "undefined") return "viewer";
  const mockAuth = localStorage.getItem("mock_auth");
  let userId: string | null = null;
  if (mockAuth) {
    try {
      userId = JSON.parse(mockAuth).user?.id;
    } catch (_) {}
  }
  if (!userId) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && qamindStorage.isUserRoleKey(key)) {
        return (localStorage.getItem(key)?.toLowerCase() as UserRole) || "viewer";
      }
    }
    return "viewer";
  }
  return (qamindStorage.get(qamindStorage.userRole(userId))?.toLowerCase() as UserRole) || "viewer";
}

export function getMinimumRoleForAction(action: string): string {
  const allowed = PERMISSIONS[action] ?? [];
  if (allowed.includes("viewer")) return "Viewer";
  if (allowed.includes("editor")) return "Editor";
  if (allowed.includes("admin")) return "Admin";
  if (allowed.includes("owner")) return "Owner";
  return "Owner";
}

export function assertPermission(role: UserRole, action: string): boolean {
  const hasAccess = can(role, action);
  if (!hasAccess) {
    const minRole = getMinimumRoleForAction(action);
    toast.error(`This action requires ${minRole} access.`, {
      icon: <Lock className="h-4 w-4 text-amber-500" />,
      duration: 3000,
      position: "bottom-right",
    });
  }
  return hasAccess;
}

export function useAssertPermission() {
  const { currentUser } = useUserStore();
  const currentRole = currentUser?.role ?? "viewer";
  return (action: string) => assertPermission(currentRole, action);
}

export function TokenCostLabel({ baseText }: { baseText: string }) {
  const currentRole = useCurrentRole();
  const [tokens] = useTokens();

  if (currentRole !== "Owner") {
    return <>{baseText}</>;
  }

  const isLow = tokens.balance < 20 && tokens.plan !== "Premium";

  return (
    <>
      {baseText}{" "}
      <span
        className={
          isLow
            ? "text-amber-500 font-bold animate-[pulse_1.5s_infinite] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            : "opacity-80 font-normal"
        }
      >
        · 5 tokens
      </span>
    </>
  );
}

export function usePermission(action: string): boolean {
  const { currentUser } = useUserStore();
  return can(currentUser?.role ?? "viewer", action);
}

interface PermissionGateProps {
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
  disabledTooltip?: string;
}

export function PermissionGate({
  action,
  children,
  fallback = null,
  disabledTooltip,
}: PermissionGateProps) {
  const hasAccess = usePermission(action);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Check if action is destructive (delete, danger, superadmin)
  const isDestructive =
    action.includes("delete") || action.includes("danger") || action.includes("superadmin");

  if (isDestructive) {
    return <>{fallback}</>;
  }

  // If creation/feature action (generate, run, create) and tooltip is provided
  const isCreationOrFeature =
    action.includes("generate") ||
    action.includes("run") ||
    action.includes("create") ||
    action.includes("save") ||
    action.includes("log") ||
    action.includes("toggle") ||
    action.includes("configure") ||
    action.includes("upload") ||
    action.includes("add") ||
    action.includes("edit") ||
    action.includes("remove");

  if (isCreationOrFeature && disabledTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div style={{ display: "inline-block", cursor: "not-allowed" }}>
              <div style={{ pointerEvents: "none", opacity: 0.4 }}>{children}</div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <span>{disabledTooltip}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <>{fallback}</>;
}
