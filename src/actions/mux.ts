"use server";

import { auth } from "@/lib/auth";
import { mux } from "@/lib/mux";
import { db } from "@/lib/db";

export async function createMuxUploadUrl(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ["public"],
      encoding_tier: "baseline",
    },
    cors_origin: process.env.NEXT_PUBLIC_APP_URL || "*",
  });

  await db.lesson.update({
    where: { id: lessonId },
    data: { muxUploadId: upload.id },
  });

  return { uploadUrl: upload.url, uploadId: upload.id };
}

export async function deleteMuxAsset(assetId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await mux.video.assets.delete(assetId);
  } catch {
    // Asset may already be deleted
  }

  return { success: true };
}
