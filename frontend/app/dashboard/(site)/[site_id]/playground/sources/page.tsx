import { Heading } from '@/components/ui/heading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SourcesPlayground } from './SourcesPlayground';
import { Bot, Code2Icon } from 'lucide-react';
import { PageProps } from '@/types';
import { getSiteId } from '@/lib/api';
import BreadCrumb from '@/components/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { PlaygroundSourcesContextProvider } from './PlaygroundSourcesContextProvider';

const title = "Playground";
const description = "Test the bot and source retrieval capabilities.";

export default async function page({ params }: PageProps) {
  const siteId = getSiteId(params);

  const breadcrumbItems = [
    { title: 'Playground', link: `/dashboard/${siteId}/playground` },
    { title: 'Sources', link: `/dashboard/${siteId}/playground/sources` },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">

        <BreadCrumb items={breadcrumbItems} />

        <Heading title={title} description={description} />

        <Separator />

        <PlaygroundSourcesContextProvider siteId={siteId}>
          <SourcesPlayground siteId={siteId} />
        </PlaygroundSourcesContextProvider>

      </div>
    </ScrollArea>
  );
}
