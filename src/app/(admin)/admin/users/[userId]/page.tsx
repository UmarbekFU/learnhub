import { Metadata } from "next";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AdminUserRoleSelect } from "@/components/admin/admin-user-role-select";

export const metadata: Metadata = { title: "User Detail" };

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: {
        include: { course: { select: { title: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      courses: {
        select: { id: true, title: true, status: true, totalStudents: true },
        orderBy: { createdAt: "desc" },
      },
      subscription: true,
      _count: { select: { enrollments: true, courses: true, reviews: true, certificates: true } },
    },
  });

  if (!user) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.image || ""} />
          <AvatarFallback className="text-xl">{user.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user.name || "Unknown"}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <div className="ml-auto">
          <AdminUserRoleSelect userId={user.id} currentRole={user.role} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Enrollments", value: user._count.enrollments },
          { label: "Courses Created", value: user._count.courses },
          { label: "Reviews", value: user._count.reviews },
          { label: "Certificates", value: user._count.certificates },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {user.subscription && (
        <Card>
          <CardHeader><CardTitle>Subscription</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-4">
            <Badge>{user.subscription.plan}</Badge>
            <Badge variant={user.subscription.status === "ACTIVE" ? "default" : "secondary"}>
              {user.subscription.status}
            </Badge>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Enrollments</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {user.enrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <span className="font-medium">{enrollment.course.title}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{enrollment.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(enrollment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {user.enrollments.length === 0 && <p className="text-muted-foreground text-center py-4">No enrollments.</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Account Info</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</div>
          <div><span className="font-medium">Email verified:</span> {user.emailVerified ? "Yes" : "No"}</div>
          <div><span className="font-medium">Bio:</span> {user.bio || "None"}</div>
          <div><span className="font-medium">Headline:</span> {user.headline || "None"}</div>
        </CardContent>
      </Card>
    </div>
  );
}
