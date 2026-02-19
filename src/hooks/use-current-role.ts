"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

export function useCurrentRole(): UserRole | undefined {
  const session = useSession();
  return session.data?.user?.role;
}
