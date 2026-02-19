"use client";

import MuxPlayerComponent from "@mux/mux-player-react";

interface MuxPlayerProps {
  playbackId: string;
  title?: string;
}

export function MuxPlayer({ playbackId, title }: MuxPlayerProps) {
  return (
    <div className="relative aspect-video">
      <MuxPlayerComponent
        playbackId={playbackId}
        metadata={{ video_title: title }}
        streamType="on-demand"
        autoPlay={false}
        className="w-full h-full rounded-lg"
      />
    </div>
  );
}
