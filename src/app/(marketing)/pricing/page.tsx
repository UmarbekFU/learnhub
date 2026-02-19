import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { PLANS } from "@/config/subscription-plans";

export const metadata: Metadata = {
  title: "Pricing",
};

export default function PricingPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Simple, transparent pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
          {(Object.entries(PLANS) as [string, (typeof PLANS)[keyof typeof PLANS]][]).map(
            ([key, plan]) => (
              <div
                key={key}
                className={`relative rounded-xl border bg-card p-8 ${
                  key === "PRO" ? "border-2 border-primary" : ""
                }`}
              >
                {key === "PRO" && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${plan.price.monthly}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                {plan.price.yearly > 0 && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    ${plan.price.yearly}/year (save{" "}
                    {Math.round(
                      (1 - plan.price.yearly / (plan.price.monthly * 12)) * 100
                    )}
                    %)
                  </p>
                )}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full"
                  variant={key === "PRO" ? "default" : "outline"}
                  asChild
                >
                  <Link href="/sign-up">
                    {key === "FREE" ? "Get Started" : `Start ${plan.name}`}
                  </Link>
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
