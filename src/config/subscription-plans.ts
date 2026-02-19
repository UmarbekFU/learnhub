export const PLANS = {
  FREE: {
    name: "Free",
    description: "Get started with free courses",
    price: { monthly: 0, yearly: 0 },
    stripePriceId: { monthly: null, yearly: null },
    features: [
      "Access to free courses",
      "Basic progress tracking",
      "Community access",
    ],
    limits: {
      maxEnrollments: 3,
      certificatesEnabled: false,
      downloadableResources: false,
    },
  },
  PRO: {
    name: "Pro",
    description: "Unlock all courses and features",
    price: { monthly: 29, yearly: 290 },
    stripePriceId: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "",
    },
    features: [
      "Unlimited course access",
      "Certificates of completion",
      "Downloadable resources",
      "Priority support",
      "Offline viewing",
    ],
    limits: {
      maxEnrollments: Infinity,
      certificatesEnabled: true,
      downloadableResources: true,
    },
  },
  ENTERPRISE: {
    name: "Enterprise",
    description: "For teams and organizations",
    price: { monthly: 99, yearly: 990 },
    stripePriceId: {
      monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "",
      yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "",
    },
    features: [
      "Everything in Pro",
      "Team management dashboard",
      "Custom learning paths",
      "API access",
      "Dedicated account manager",
      "SSO integration",
      "Analytics & reporting",
    ],
    limits: {
      maxEnrollments: Infinity,
      certificatesEnabled: true,
      downloadableResources: true,
    },
  },
} as const;
