"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Something went wrong</h1>
          <p>A critical error occurred. Please try again.</p>
          <Button onClick={reset}>Try Again</Button>
        </div>
      </body>
    </html>
  );
}
