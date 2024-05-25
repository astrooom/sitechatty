import type { Metadata } from "next";

export const maxDuration = 60; // 1 minute

// export const dynamic = "force-static"; // This will not work since we are grabbing cookies in the layout.tsx.

export const metadata: Metadata = {
  title: "SiteChatty - Home",
  description: "SiteChatty - Free AI-powered live chat software to help your business grow",
}

export default async function Page() {
  return (
    <p>Hello!</p>
  );
}
