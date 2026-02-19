"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";

interface FileUploadProps {
  onChange: (url: string) => void;
  value?: string;
  accept?: string;
}

export function FileUpload({ onChange, value, accept = "image/*" }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Simplified upload - in production this would use UploadThing's React components
  // For now, provide a URL input as a fallback
  const [url, setUrl] = useState(value || "");

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative">
          {accept.includes("image") && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Upload" className="h-40 w-full rounded-md object-cover" />
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter image URL..."
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (url) onChange(url);
            }}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
