import { Metadata } from "next";
import { Users, BookOpen, Award, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold">About LearnHub</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            We&apos;re on a mission to make high-quality education accessible to
            everyone. Our platform connects expert instructors with eager
            learners worldwide.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Our Mission</h2>
            <p className="mt-4 text-muted-foreground">
              LearnHub was founded with a simple belief: everyone deserves access
              to high-quality education. We built a platform that empowers
              instructors to share their expertise and enables students to learn
              new skills at their own pace.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Our Vision</h2>
            <p className="mt-4 text-muted-foreground">
              We envision a world where geography, background, and financial
              status don&apos;t limit access to education. Through technology and
              community, we&apos;re making this vision a reality, one course at a
              time.
            </p>
          </div>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-4">
          {[
            { icon: Users, label: "10,000+", sublabel: "Active Students" },
            { icon: BookOpen, label: "500+", sublabel: "Courses" },
            { icon: Award, label: "25,000+", sublabel: "Certificates Issued" },
            { icon: Globe, label: "50+", sublabel: "Countries" },
          ].map((stat) => (
            <div
              key={stat.sublabel}
              className="rounded-xl border bg-card p-6 text-center"
            >
              <stat.icon className="mx-auto h-8 w-8 text-primary" />
              <div className="mt-4 text-3xl font-bold">{stat.label}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.sublabel}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
