import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Tag } from "lucide-react";

export const metadata: Metadata = { title: "Course Pricing" };

export default async function CoursePricingPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const course = await db.course.findUnique({
    where: { id: courseId, instructorId: session.user.id },
    select: { title: true, price: true, salePrice: true },
  });

  if (!course) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pricing - {course.title}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> Current Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {course.price ? `$${course.price.toFixed(2)}` : "Free"}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Set the price from the course editor page.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" /> Sale Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {course.salePrice ? `$${course.salePrice.toFixed(2)}` : "No sale"}
            </div>
            {course.salePrice && course.price && (
              <Badge variant="secondary" className="mt-2">
                {Math.round(((course.price - course.salePrice) / course.price) * 100)}% off
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
