import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

function determinePlan(priceId: string): "FREE" | "PRO" | "ENTERPRISE" {
  const proPrices = [
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  ];
  const enterprisePrices = [
    process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
    process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
  ];

  if (proPrices.includes(priceId)) return "PRO";
  if (enterprisePrices.includes(priceId)) return "ENTERPRISE";
  return "FREE";
}

function mapStripeStatus(
  status: string
): "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "TRIALING" {
  const map: Record<string, "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "TRIALING"> = {
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    unpaid: "UNPAID",
    trialing: "TRIALING",
  };
  return map[status] || "ACTIVE";
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  // Use `any` for Stripe objects since webhook payloads have runtime-defined shapes
  // that may differ from the SDK's TypeScript types depending on API version
  const eventData = event.data.object as any;

  switch (event.type) {
    case "checkout.session.completed": {
      if (eventData.mode === "subscription") {
        const sub = await stripe.subscriptions.retrieve(
          eventData.subscription as string
        ) as any;
        await db.subscription.update({
          where: { stripeCustomerId: eventData.customer as string },
          data: {
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0].price.id,
            plan: determinePlan(sub.items.data[0].price.id),
            status: "ACTIVE",
            stripeCurrentPeriodStart: sub.current_period_start
              ? new Date(sub.current_period_start * 1000)
              : null,
            stripeCurrentPeriodEnd: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : null,
          },
        });
      }

      if (
        eventData.mode === "payment" &&
        eventData.metadata?.type === "course_purchase"
      ) {
        const { userId, courseId } = eventData.metadata;

        await db.$transaction([
          db.enrollment.create({
            data: { userId, courseId, status: "ACTIVE" },
          }),
          db.payment.create({
            data: {
              userId,
              courseId,
              amount: eventData.amount_total! / 100,
              status: "COMPLETED",
              type: "course_purchase",
              stripePaymentId: eventData.payment_intent as string,
            },
          }),
          db.course.update({
            where: { id: courseId },
            data: { totalStudents: { increment: 1 } },
          }),
        ]);
      }
      break;
    }

    case "invoice.payment_succeeded": {
      if (eventData.subscription) {
        const sub = await stripe.subscriptions.retrieve(
          eventData.subscription as string
        ) as any;
        await db.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: "ACTIVE",
            stripeCurrentPeriodStart: sub.current_period_start
              ? new Date(sub.current_period_start * 1000)
              : null,
            stripeCurrentPeriodEnd: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : null,
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      await db.subscription.update({
        where: { stripeSubscriptionId: eventData.id },
        data: {
          plan: determinePlan(eventData.items.data[0].price.id),
          status: mapStripeStatus(eventData.status),
          cancelAtPeriodEnd: eventData.cancel_at_period_end,
          stripeCurrentPeriodEnd: eventData.current_period_end
            ? new Date(eventData.current_period_end * 1000)
            : null,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      await db.subscription.update({
        where: { stripeSubscriptionId: eventData.id },
        data: {
          plan: "FREE",
          status: "CANCELED",
          stripeSubscriptionId: null,
          stripePriceId: null,
        },
      });
      break;
    }
  }

  return new Response("OK", { status: 200 });
}
