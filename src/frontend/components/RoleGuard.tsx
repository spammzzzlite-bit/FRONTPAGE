import React from "react";
import { useCurrentRole, WorkspaceRole } from "@/frontend/store/store";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: WorkspaceRole[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const currentRole = useCurrentRole();

  if (allowedRoles.includes(currentRole)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
