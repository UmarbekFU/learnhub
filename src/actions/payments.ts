"use server";

import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLANS } from "@/config/subscription-plans";

export async function createSubscriptionCheckout(
  plan: "PRO" | "ENTERPRISE",
  interval: "monthly" | "yearly"
) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return { error: "Unauthorized" };
  }

  const planConfig = PLANS[plan];
  const priceId = planConfig.stripePriceId[interval];
  if (!priceId) return { error: "Invalid plan" };

  let subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  let customerId = subscription?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: session.user.name || undefined,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;

    await db.subscription.upsert({
      where: { userId: session.user.id },
      update: { stripeCustomerId: customerId },
      create: {
        userId: session.user.id,
        stripeCustomerId: customerId,
        plan: "FREE",
        status: "ACTIVE",
      },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    metadata: { userId: session.user.id, plan },
  });

  return { url: checkoutSession.url };
}

export async function createCourseCheckout(courseId: string) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return { error: "Unauthorized" };
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { instructor: true },
  });
  if (!course || !course.price) return { error: "Course not found or is free" };

  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing) return { error: "Already enrolled" };

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
            description: course.shortDescription || undefined,
            images: course.imageUrl ? [course.imageUrl] : [],
          },
          unit_amount: Math.round((course.salePrice || course.price) * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.slug}/learn`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.slug}`,
    metadata: {
      userId: session.user.id,
      courseId,
      type: "course_purchase",
    },
  });

  return { url: checkoutSession.url };
}

export async function createBillingPortalSession() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (!subscription?.stripeCustomerId) return { error: "No subscription" };

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  return { url: portalSession.url };
}
