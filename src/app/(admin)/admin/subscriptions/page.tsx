import { Metadata } from "next";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Subscriptions" };

export default async function AdminSubscriptionsPage() {
  const subscriptions = await db.subscription.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const planCounts = {
    FREE: subscriptions.filter((s) => s.plan === "FREE").length,
    PRO: subscriptions.filter((s) => s.plan === "PRO").length,
    ENTERPRISE: subscriptions.filter((s) => s.plan === "ENTERPRISE").length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Subscriptions</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(planCounts).map(([plan, count]) => (
          <Card key={plan}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{plan} Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground">active subscribers</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>All Subscriptions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period End</TableHead>
                <TableHead>Auto-Renew</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.user.name || sub.user.email}</TableCell>
                  <TableCell><Badge variant={sub.plan === "FREE" ? "outline" : "default"}>{sub.plan}</Badge></TableCell>
                  <TableCell><Badge variant={sub.status === "ACTIVE" ? "default" : "secondary"}>{sub.status}</Badge></TableCell>
                  <TableCell>{sub.stripeCurrentPeriodEnd ? new Date(sub.stripeCurrentPeriodEnd).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{sub.cancelAtPeriodEnd ? "No" : "Yes"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
