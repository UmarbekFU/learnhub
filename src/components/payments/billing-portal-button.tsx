"use client";

import { useTransition } from "react";
import { createBillingPortalSession } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

export function BillingPortalButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await createBillingPortalSession();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.url) {
        window.location.href = result.url;
      }
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      Manage Billing
    </Button>
  );
}
