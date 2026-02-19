import { Metadata } from "next";
import { db } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminUserRoleSelect } from "@/components/admin/admin-user-role-select";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Manage Users",
};

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true, courses: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Courses Created</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Link href={`/admin/users/${user.id}`} className="flex items-center gap-2 hover:underline">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback>
                          {user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {user.name || "Unknown"}
                    </Link>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <AdminUserRoleSelect userId={user.id} currentRole={user.role} />
                  </TableCell>
                  <TableCell>{user._count.enrollments}</TableCell>
                  <TableCell>{user._count.courses}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
