import { Metadata } from "next";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle, Calendar } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ credentialId: string }>;
}): Promise<Metadata> {
  const { credentialId } = await params;
  return { title: `Certificate ${credentialId}` };
}

export default async function CertificateVerifyPage({
  params,
}: {
  params: Promise<{ credentialId: string }>;
}) {
  const { credentialId } = await params;

  const certificate = await db.certificate.findUnique({
    where: { credentialId },
    include: {
      user: { select: { name: true, image: true } },
      course: {
        select: {
          title: true,
          slug: true,
          instructor: { select: { name: true } },
        },
      },
    },
  });

  if (!certificate) notFound();

  return (
    <div className="mx-auto max-w-2xl py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Verified Certificate</span>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader className="text-center pb-2">
          <Award className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold">Certificate of Completion</h1>
        </CardHeader>
        <CardContent className="text-center space-y-6 pt-4">
          <div>
            <p className="text-sm text-muted-foreground">This certifies that</p>
            <p className="text-2xl font-semibold mt-1">{certificate.user.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              has successfully completed
            </p>
            <p className="text-xl font-semibold mt-1">
              {certificate.course.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Instructed by {certificate.course.instructor.name}
            </p>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(certificate.issuedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div>
              <Badge variant="outline">ID: {certificate.credentialId}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
