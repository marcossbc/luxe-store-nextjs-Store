"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">We apologize for the inconvenience. Please try again.</p>
        <h1 className="text-4xl font-bold text-foreground mb-4">500</h1>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
