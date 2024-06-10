import { Heading } from '@/components/ui/heading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SourcesPlayground } from './SourcesPlayground';
import { Bot, Code2Icon } from 'lucide-react';
import { PageProps } from '@/types';
import { getSiteId } from '@/lib/api';

export default async function page({ params }: PageProps) {
  const siteId = getSiteId(params);

  const title = "Playground";
  const description = "Test the bot and source retrieval capabilities.";

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Heading title={title} description={description} />

        <Tabs defaultValue="chat">
          <TabsList>
            <TabsTrigger value="chat"><div><Bot className="inline" /> Chat with Bot</div></TabsTrigger>
            <TabsTrigger value="sources"><div><Code2Icon className="inline" /> Search Sources</div></TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex flex-col gap-y-4">

          </TabsContent>

          <TabsContent value="sources" className="space-y-2" >
            <SourcesPlayground siteId={siteId} />
          </TabsContent>
        </Tabs>

      </div>
    </ScrollArea>
  );
}
