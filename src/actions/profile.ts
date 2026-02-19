"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string; bio?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      bio: data.bio || null,
    },
  });

  revalidatePath("/settings/profile");
  revalidatePath("/settings");
  return { success: true };
}
