import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/config/subscription-plans";
import { BillingPortalButton } from "@/components/payments/billing-portal-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const plan = subscription?.plan || "FREE";
  const planConfig = PLANS[plan as keyof typeof PLANS];

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Billing</h1>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{planConfig.name}</h2>
              <p className="text-sm text-muted-foreground">
                {planConfig.description}
              </p>
            </div>
            <Badge variant={plan === "FREE" ? "outline" : "default"} className="text-sm">
              {plan}
            </Badge>
          </div>

          <div className="space-y-2">
            {planConfig.features.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-500" />
                {feature}
              </div>
            ))}
          </div>

          {subscription?.stripeCurrentPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              {subscription.cancelAtPeriodEnd
                ? "Cancels"
                : "Renews"}{" "}
              on{" "}
              {new Date(
                subscription.stripeCurrentPeriodEnd
              ).toLocaleDateString()}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            {subscription?.stripeCustomerId ? (
              <BillingPortalButton />
            ) : (
              <Link href="/pricing">
                <Button>Upgrade Plan</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
