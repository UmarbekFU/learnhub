"use client";

import { useCurrentRole } from "@/hooks/use-current-role";
import { UserRole } from "@prisma/client";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const role = useCurrentRole();

  if (!role || !allowedRoles.includes(role)) {
    return fallback || null;
  }

  return <>{children}</>;
}
