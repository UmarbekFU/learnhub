import { Metadata } from "next";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Payments" };

const statusColors: Record<string, string> = {
  COMPLETED: "bg-emerald-500",
  PENDING: "bg-yellow-500",
  FAILED: "bg-red-500",
  REFUNDED: "bg-slate-500",
};

export default async function AdminPaymentsPage() {
  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });

  const totalRevenue = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payments</h1>
        <Badge variant="outline" className="text-lg px-4 py-1">Total: ${totalRevenue.toFixed(2)}</Badge>
      </div>
      <Card>
        <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.user.name || payment.user.email}</TableCell>
                  <TableCell className="capitalize">{payment.type.replace("_", " ")}</TableCell>
                  <TableCell className="font-medium">${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${statusColors[payment.status]} text-white`}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No payments yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
