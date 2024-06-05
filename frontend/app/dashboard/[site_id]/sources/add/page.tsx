
import BreadCrumb from '@/components/breadcrumb';
import { Button, buttonVariants } from '@/components/ui/button';

import { Heading } from '@/components/ui/heading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe, FileUp, Text } from 'lucide-react';

import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { PageProps } from '@/.next/types/app/layout';
import { getSiteId } from '@/lib/api';

const title = "Add Sources";
const description = "Add Sources for the bot";

export default async function page({ params }: PageProps) {
  const siteId = getSiteId(params);

  const breadcrumbItems = [{ title: 'Sources', link: `/dashboard/${siteId}/sources` }, { title: 'Add', link: `/dashboard/${siteId}/sources/add` }];
  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex items-start justify-between">
          <Heading title={title} description={description} />
        </div>

        <Separator />

        <Tabs defaultValue="website">
          <TabsList>
            <TabsTrigger value="website"><div><Globe className="inline" /> Website</div></TabsTrigger>
            <TabsTrigger value="upload"><div><FileUp className="inline" /> File Upload</div></TabsTrigger>
            <TabsTrigger value="input"><div><Text className="inline" /> Text Input</div></TabsTrigger>
          </TabsList>

          <TabsContent value="website" className="flex flex-col gap-y-4">

            <Card>
              <CardHeader>
                <CardTitle>
                  Scan Website
                </CardTitle>
              </CardHeader>
              <CardContent >
                <p>
                  Automatically scan all available links on your website by entering the homepage URL.
                </p>
              </CardContent>
              <CardFooter>
                <div className="flex flex-col gap-3 w-3/12">
                  <Input placeholder="https://example.com" />
                  <Button >Start</Button>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Add Singular Link
                </CardTitle>
              </CardHeader>
              <CardContent >
                <p>
                  Add a singular link from your website.
                </p>
              </CardContent>
              <CardFooter>
                <div className="flex flex-col gap-3 w-3/12">
                  <Input placeholder="https://example.com/knowledgebase/how-to-start" />
                  <Button>Add</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            test
          </TabsContent>
        </Tabs>

      </div>
    </ScrollArea>
  );
}


