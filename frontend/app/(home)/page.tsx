import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Blocks, Globe2, MessageSquare, TextSearch } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { GetStartedForm } from './GetStartedForm';

export const maxDuration = 60; // 1 minute

// export const dynamic = "force-static"; // This will not work since we are grabbing cookies in the layout.tsx.

export const metadata: Metadata = {
  title: 'SiteChatty - Home',
  description:
    'SiteChatty - Free AI-powered live chat software to help your business grow'
};

export default async function Page() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-y-24 overflow-y-scroll">
      <div className="flex flex-col gap-y-8 drop-shadow-sm">
        <div className="flex items-center gap-x-2">
          <Image src="/logo/rounded.svg" alt="Logo" width={48} height={48} />{' '}
          <h1 className="text-center text-5xl font-semibold drop-shadow-sm">
            SiteChatty
          </h1>
        </div>

        <section className="inline-block bg-gradient-to-r from-fuchsia-800 to-indigo-800 bg-clip-text text-lg text-transparent dark:from-indigo-300 dark:to-fuchsia-300">
          <p>
            Enhance your business with AI-powered information extraction
            directly from your website.
          </p>
          {/* <p>Save time and boost your productivity with <strong>SiteChatty</strong>.</p> */}

          <div className="text-right font-semibold">
            <small>Powered by ChatGPT-4 and ChatGPT-4o.</small>
          </div>
        </section>

        <section className="flex flex-row gap-x-2">
          {/* <Input
            className="h-10 w-9/12"
            type="url"
            placeholder="Enter Your Websites Main URL [ex: https://example.com]"
          />
          <Button className="h-10 w-3/12 bg-gradient-to-r from-fuchsia-600 to-indigo-600 dark:from-indigo-300 dark:to-fuchsia-300">
            Get Started Now
          </Button> */}

          <GetStartedForm />
        </section>

        <section className="text-base">
          <p className="font-semibold underline">SiteChatty...</p>

          <ol className="my-2 flex list-inside flex-col gap-y-3">
            <li>
              <Globe2 className="inline" /> Automatically scans your website for
              content accross all or select pages.
            </li>
            <li>
              <TextSearch className="inline" /> Automatically extracts your
              unstructured website data into a structured format useable by AI.
            </li>
            <li>
              <MessageSquare className="inline" /> Provides a chat widget to
              your website for you or your customers to interact with in
              real-time.
            </li>
            <li>
              <Blocks className="inline" /> Provides a real-time API for
              building your own integrations.
            </li>
          </ol>

          <small className="my-2">
            Your website data is kept <strong>privately</strong> and can be{' '}
            <strong>deleted anytime</strong>.
          </small>
        </section>
      </div>
    </div>
  );
}
