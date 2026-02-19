import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = { title: "Discussions" };

export default async function CourseDiscussionsPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const course = await db.course.findUnique({
    where: { slug: courseSlug },
    select: { id: true, title: true },
  });

  if (!course) notFound();

  const discussions = await db.discussion.findMany({
    where: { courseId: course.id },
    include: {
      user: { select: { name: true, image: true } },
      _count: { select: { replies: true } },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Discussions - {course.title}</h1>
      </div>

      {discussions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16">
          <MessageSquare className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No discussions yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to start a discussion!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {discussions.map((discussion) => (
            <Card key={discussion.id}>
              <CardContent className="flex items-start gap-4 p-4">
                <Avatar>
                  <AvatarImage src={discussion.user.image || ""} />
                  <AvatarFallback>{discussion.user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{discussion.title}</h3>
                    {discussion.isPinned && <Badge variant="secondary">Pinned</Badge>}
                    {discussion.isResolved && <Badge variant="default">Resolved</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {discussion.content}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{discussion.user.name}</span>
                    <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                    <span>{discussion._count.replies} replies</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
