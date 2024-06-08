import { Heading } from '@/components/ui/heading';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Chat } from './chat';

export default async function page() {
  const title = "Playground";
  const description = "Try the bot";

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Heading title={title} description={description} />
        <Chat />
      </div>
    </ScrollArea>
  );
}
