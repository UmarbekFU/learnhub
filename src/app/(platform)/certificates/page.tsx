import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Certificates",
};

export default async function CertificatesPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const certificates = await db.certificate.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        select: { title: true, slug: true, instructor: { select: { name: true } } },
      },
    },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Certificates</h1>

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16">
          <Award className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No certificates yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete a course to earn your first certificate
          </p>
          <Button className="mt-4" asChild>
            <Link href="/browse">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <Award className="h-16 w-16 text-primary" />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="font-semibold">{cert.course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {cert.course.instructor.name}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Issued {new Date(cert.issuedAt).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-xs font-mono text-muted-foreground">
                    ID: {cert.credentialId}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
