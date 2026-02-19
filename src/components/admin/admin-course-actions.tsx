"use client";

import { useTransition, useState } from "react";
import { approveCourse, rejectCourse } from "@/actions/analytics";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";

interface AdminCourseActionsProps {
  courseId: string;
  status: string;
}

export function AdminCourseActions({ courseId, status }: AdminCourseActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  function handleApprove() {
    startTransition(async () => {
      const result = await approveCourse(courseId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Course approved!");
      }
    });
  }

  function handleReject() {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    startTransition(async () => {
      const result = await rejectCourse(courseId, rejectReason);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Course rejected with feedback");
        setShowRejectDialog(false);
        setRejectReason("");
      }
    });
  }

  if (status !== "UNDER_REVIEW") {
    return <span className="text-sm text-muted-foreground">-</span>;
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleApprove}
          disabled={isPending}
          className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          <span className="ml-1">Approve</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowRejectDialog(true)}
          disabled={isPending}
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
          <span className="ml-1">Reject</span>
        </Button>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Course</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Explain what needs to be changed..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
