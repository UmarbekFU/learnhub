"use client";

import { useTransition } from "react";
import { markAsRead, markAllAsRead } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, CheckCheck, Loader2 } from "lucide-react";

interface NotificationActionsProps {
  type: "mark-one" | "mark-all";
  notificationId?: string;
}

export function NotificationActions({ type, notificationId }: NotificationActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleAction() {
    startTransition(async () => {
      if (type === "mark-all") {
        const result = await markAllAsRead();
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("All notifications marked as read");
        }
      } else if (notificationId) {
        const result = await markAsRead(notificationId);
        if (result.error) {
          toast.error(result.error);
        }
      }
    });
  }

  if (type === "mark-all") {
    return (
      <Button variant="outline" size="sm" onClick={handleAction} disabled={isPending}>
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCheck className="mr-2 h-4 w-4" />
        )}
        Mark all as read
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleAction} disabled={isPending}>
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Check className="h-4 w-4" />
      )}
    </Button>
  );
}
