"use client";

import { useTransition } from "react";
import { updateUserRole } from "@/actions/analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AdminUserRoleSelectProps {
  userId: string;
  currentRole: string;
}

export function AdminUserRoleSelect({ userId, currentRole }: AdminUserRoleSelectProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(role: string) {
    if (role === currentRole) return;
    startTransition(async () => {
      const result = await updateUserRole(userId, role as "STUDENT" | "INSTRUCTOR" | "ADMIN");
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Role updated to ${role}`);
      }
    });
  }

  return (
    <Select defaultValue={currentRole} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="STUDENT">Student</SelectItem>
        <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
        <SelectItem value="ADMIN">Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}
