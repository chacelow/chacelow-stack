export const dynamic = "force-static";

import { api } from "@chacelow-stack/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";

import { SITE_URL } from "@/lib/site";
import { isConvexConfigured } from "@/lib/convex-config";

import { ShowcasePage } from "./_components/showcase-page";

export const metadata: Metadata = {
  title: "Showcase - Chacelow-Stack",
  description: "Projects created with Chacelow-Stack",
  alternates: {
    canonical: "/showcase",
  },
  openGraph: {
    title: "Showcase - Chacelow-Stack",
    description: "Projects created with Chacelow-Stack",
    url: `${SITE_URL}/showcase`,
    images: [
      {
        url: `${SITE_URL}/og/site/showcase.png`,
        width: 1200,
        height: 630,
        alt: "Chacelow-Stack Showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Showcase - Chacelow-Stack",
    description: "Projects created with Chacelow-Stack",
    images: [`${SITE_URL}/og/site/showcase.png`],
  },
};

export default async function Showcase() {
  const showcaseProjects = isConvexConfigured
    ? await fetchQuery(api.showcase.getShowcaseProjects)
    : [];
  return <ShowcasePage showcaseProjects={showcaseProjects} />;
}
