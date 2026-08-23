"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@/components/ui/sonner";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {convex ? (
        <ConvexProvider client={convex}>
          <NuqsAdapter>{children}</NuqsAdapter>
        </ConvexProvider>
      ) : (
        <NuqsAdapter>{children}</NuqsAdapter>
      )}
      <Toaster />
    </>
  );
}
