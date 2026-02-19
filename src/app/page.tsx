import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  BookOpen,
  Users,
  Award,
  Play,
  CheckCircle,
  Star,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Expert-Led Courses",
    description: "Learn from industry professionals with real-world experience",
  },
  {
    icon: Play,
    title: "HD Video Content",
    description: "High-quality video lessons with adaptive streaming",
  },
  {
    icon: Award,
    title: "Certificates",
    description: "Earn certificates of completion to showcase your skills",
  },
  {
    icon: Users,
    title: "Community",
    description: "Join a community of learners and share knowledge",
  },
  {
    icon: Zap,
    title: "Learn at Your Pace",
    description: "Access courses anytime, anywhere on any device",
  },
  {
    icon: Shield,
    title: "Lifetime Access",
    description: "Once enrolled, access your courses forever",
  },
];

const stats = [
  { label: "Active Students", value: "10,000+" },
  { label: "Courses", value: "500+" },
  { label: "Instructors", value: "100+" },
  { label: "Certificates Issued", value: "25,000+" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/50 py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">
              <Star className="mr-1 h-3 w-3" />
              Trusted by 10,000+ students worldwide
            </Badge>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Master New Skills with{" "}
              <span className="text-primary">Expert-Led</span> Courses
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Access hundreds of courses taught by industry experts. Learn at your
              own pace with high-quality video content, hands-on projects, and
              certificates of completion.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/browse">
                  Browse Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sign-up">Start Free</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                Everything you need to succeed
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our platform provides all the tools for effective learning
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="border-t bg-muted/30 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start for free, upgrade when you need more
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="rounded-xl border bg-card p-8 text-left">
                <h3 className="text-lg font-semibold">Free</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {["Access to free courses", "Basic progress tracking", "Community access"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full" variant="outline" asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </div>

              {/* Pro Plan */}
              <div className="relative rounded-xl border-2 border-primary bg-card p-8 text-left">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
                <h3 className="text-lg font-semibold">Pro</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {[
                    "Unlimited course access",
                    "Certificates of completion",
                    "Downloadable resources",
                    "Priority support",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full" asChild>
                  <Link href="/sign-up">Start Pro</Link>
                </Button>
              </div>

              {/* Enterprise Plan */}
              <div className="rounded-xl border bg-card p-8 text-left">
                <h3 className="text-lg font-semibold">Enterprise</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {[
                    "Everything in Pro",
                    "Team management",
                    "Custom learning paths",
                    "Analytics & reporting",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full" variant="outline" asChild>
                  <Link href="/sign-up">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-12 text-primary-foreground">
              <Globe className="mx-auto h-12 w-12" />
              <h2 className="mt-4 text-3xl font-bold">Ready to start learning?</h2>
              <p className="mt-4 text-primary-foreground/80">
                Join thousands of students already mastering new skills on LearnHub.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-8"
                asChild
              >
                <Link href="/sign-up">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
