"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  return db.notification.count({
    where: { userId: session.user.id, isRead: false },
  });
}

export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.notification.update({
    where: { id: notificationId, userId: session.user.id },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
  return { success: true };
}
