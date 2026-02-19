import { Metadata } from "next";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, BookOpen, GraduationCap } from "lucide-react";

export const metadata: Metadata = { title: "Platform Analytics" };

export default async function AdminAnalyticsPage() {
  const [totalUsers, totalCourses, totalEnrollments, totalRevenue, usersByRole, coursesByStatus, recentPayments] =
    await Promise.all([
      db.user.count(),
      db.course.count(),
      db.enrollment.count(),
      db.payment.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }),
      db.user.groupBy({ by: ["role"], _count: true }),
      db.course.groupBy({ by: ["status"], _count: true }),
      db.payment.findMany({
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true } } },
      }),
    ]);

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-500" },
    { label: "Total Courses", value: totalCourses, icon: BookOpen, color: "text-purple-500" },
    { label: "Total Enrollments", value: totalEnrollments, icon: GraduationCap, color: "text-emerald-500" },
    { label: "Total Revenue", value: `$${(totalRevenue._sum.amount || 0).toFixed(2)}`, icon: DollarSign, color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Platform Analytics</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Users by Role</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {usersByRole.map((group) => (
              <div key={group.role} className="flex items-center justify-between">
                <span className="capitalize">{group.role.toLowerCase()}</span>
                <span className="font-bold">{group._count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Courses by Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {coursesByStatus.map((group) => (
              <div key={group.status} className="flex items-center justify-between">
                <span>{group.status.replace("_", " ")}</span>
                <span className="font-bold">{group._count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Recent Revenue</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{p.user.name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="font-bold text-emerald-600">${p.amount.toFixed(2)}</span>
              </div>
            ))}
            {recentPayments.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No payments yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
