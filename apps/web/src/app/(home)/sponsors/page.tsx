export const dynamic = "force-static";

import { api } from "@chacelow-stack/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";

import { SITE_URL } from "@/lib/site";
import { fetchSponsors } from "@/lib/sponsors";
import { isConvexConfigured } from "@/lib/convex-config";

import { SponsorsPage } from "./_components/sponsors-page";

export const metadata: Metadata = {
  title: "Sponsors - Chacelow-Stack",
  description: "The companies and developers funding Chacelow-Stack development",
  alternates: {
    canonical: "/sponsors",
  },
  openGraph: {
    title: "Sponsors - Chacelow-Stack",
    description: "The companies and developers funding Chacelow-Stack development",
    url: `${SITE_URL}/sponsors`,
    images: [
      {
        url: `${SITE_URL}/og/site/sponsors.png`,
        width: 1200,
        height: 630,
        alt: "Chacelow-Stack Sponsors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sponsors - Chacelow-Stack",
    description: "The companies and developers funding Chacelow-Stack development",
    images: [`${SITE_URL}/og/site/sponsors.png`],
  },
};

export default async function Sponsors() {
  const [sponsorsData, stats] = await Promise.all([
    fetchSponsors(),
    isConvexConfigured ? fetchQuery(api.analytics.getStats, {}) : Promise.resolve(null),
  ]);
  return <SponsorsPage sponsorsData={sponsorsData} totalProjects={stats?.totalProjects ?? 0} />;
}
