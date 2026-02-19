import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();
  const headersList = await headers();
  const signature = headersList.get("mux-signature");

  // In production, verify the Mux webhook signature
  // For now, we handle the events directly

  const { type, data } = body;

  switch (type) {
    case "video.asset.ready": {
      const assetId = data.id;
      const playbackId = data.playback_ids?.[0]?.id;
      const duration = Math.round(data.duration || 0);

      if (playbackId) {
        await db.lesson.updateMany({
          where: { muxAssetId: assetId },
          data: {
            muxPlaybackId: playbackId,
            duration,
          },
        });
      }
      break;
    }

    case "video.asset.errored": {
      const assetId = data.id;
      await db.lesson.updateMany({
        where: { muxAssetId: assetId },
        data: {
          muxAssetId: null,
          muxPlaybackId: null,
        },
      });
      break;
    }

    case "video.upload.asset_created": {
      const uploadId = data.id;
      const assetId = data.asset_id;

      if (assetId) {
        await db.lesson.updateMany({
          where: { muxUploadId: uploadId },
          data: { muxAssetId: assetId },
        });
      }
      break;
    }
  }

  return new Response("OK", { status: 200 });
}
