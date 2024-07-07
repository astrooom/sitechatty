import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Blocks, Globe2, MessageSquare, TextSearch } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

export const maxDuration = 60; // 1 minute

// export const dynamic = "force-static"; // This will not work since we are grabbing cookies in the layout.tsx.

export const metadata: Metadata = {
  title: "SiteChatty - Home",
  description: "SiteChatty - Free AI-powered live chat software to help your business grow",
}

export default async function Page() {
  return (
    <div className="h-full flex flex-col gap-y-24 items-center justify-center overflow-y-scroll">

      <div className="drop-shadow-sm flex flex-col gap-y-8">
        <div className="flex gap-x-2 items-center">
          <Image src="/logo/rounded.svg" alt="Logo" width={48} height={48} /> <h1 className="text-center text-5xl drop-shadow-sm font-semibold">SiteChatty</h1>
        </div>

        <section className="text-lg bg-gradient-to-r from-fuchsia-800 to-indigo-800 dark:from-indigo-300 dark:to-fuchsia-300 inline-block text-transparent bg-clip-text">
          <p>Enhance your business with AI-powered information extraction directly from your website.</p>
          {/* <p>Save time and boost your productivity with <strong>SiteChatty</strong>.</p> */}

          <div className="text-right font-semibold">
            <small>Powered by ChatGPT-4 and ChatGPT-4o.</small>
          </div>
        </section>

        <section className="flex flex-row gap-x-2">
          <Input className="w-9/12 h-10" type="url" placeholder="Enter Your Websites Main URL [ex: https://example.com]" />
          <Button className="w-3/12 h-10 bg-gradient-to-r from-fuchsia-600 to-indigo-600 dark:from-indigo-300 dark:to-fuchsia-300">Get Started Now</Button>

        </section>



        <section className="text-base">
          <p className="font-semibold underline">SiteChatty...</p>

          <ol className="my-2 list-inside flex flex-col gap-y-3">
            <li>
              <Globe2 className="inline" />  Automatically scans your website for content accross all or select pages.
            </li>
            <li>
              <TextSearch className="inline" />  Automatically extracts your unstructured website data into a structured format useable by AI.
            </li>
            <li>
              <MessageSquare className="inline" /> Provides a chat widget to your website for you or your customers to interact with in real-time.
            </li>
            <li>
              <Blocks className="inline" />  Provides a real-time API for building your own integrations.
            </li>
          </ol>

          <small className="my-2">Your website data is kept <strong>privately</strong> and can be <strong>deleted anytime</strong>.</small>
        </section>
      </div>
    </div>
  );
}
