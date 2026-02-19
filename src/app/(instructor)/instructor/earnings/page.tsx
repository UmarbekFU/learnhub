import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Wallet } from "lucide-react";

export const metadata: Metadata = { title: "Earnings" };

export default async function InstructorEarningsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const courseIds = (
    await db.course.findMany({
      where: { instructorId: session.user.id },
      select: { id: true },
    })
  ).map((c) => c.id);

  const [totalRevenue, payments, thisMonthRevenue] = await Promise.all([
    db.payment.aggregate({
      _sum: { amount: true },
      where: { courseId: { in: courseIds }, status: "COMPLETED" },
    }),
    db.payment.findMany({
      where: { courseId: { in: courseIds }, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { name: true, email: true } } },
    }),
    db.payment.aggregate({
      _sum: { amount: true },
      where: {
        courseId: { in: courseIds },
        status: "COMPLETED",
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
  ]);

  const platformFee = 0.1;
  const total = totalRevenue._sum.amount || 0;
  const thisMonth = thisMonthRevenue._sum.amount || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Earnings</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${total.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${thisMonth.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Earnings</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(total * (1 - platformFee)).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{(platformFee * 100)}% platform fee</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest course purchases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{payment.user.name || payment.user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${payment.amount.toFixed(2)}</p>
                  <Badge variant="secondary" className="text-xs">{payment.status}</Badge>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
