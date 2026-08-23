import { api } from "@chacelow-stack/backend/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";

import { SITE_URL } from "@/lib/site";

import { AnalyticsClient } from "./analytics-client";

export const metadata: Metadata = {
  title: "Analytics - Chacelow-Stack",
  description: "Convex-backed project creation analytics for Chacelow-Stack.",
  alternates: {
    canonical: "/analytics",
  },
  openGraph: {
    title: "Analytics - Chacelow-Stack",
    description: "Convex-backed project creation analytics for Chacelow-Stack.",
    url: `${SITE_URL}/analytics`,
    images: [
      {
        url: `${SITE_URL}/og/site/analytics.png`,
        width: 1200,
        height: 630,
        alt: "Chacelow-Stack Convex Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Analytics - Chacelow-Stack",
    description: "Convex-backed project creation analytics for Chacelow-Stack.",
    images: [`${SITE_URL}/og/site/analytics.png`],
  },
};

export default async function Analytics() {
  const [preloadedStats, preloadedDailyStats, preloadedMonthlyStats] = await Promise.all([
    preloadQuery(api.analytics.getStats, {}),
    preloadQuery(api.analytics.getDailyStats, { days: 30 }),
    preloadQuery(api.analytics.getMonthlyStats, {}),
  ]);

  return (
    <AnalyticsClient
      preloadedStats={preloadedStats}
      preloadedDailyStats={preloadedDailyStats}
      preloadedMonthlyStats={preloadedMonthlyStats}
    />
  );
}
