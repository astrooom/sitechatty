"use client"

import { Globe, Text } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextInput } from './TextInput';
import { Modal } from '@/components/ui/modal';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AddSingularLink } from './(website)/AddSingularLink';
import { ScanWebsite } from './(website)/ScanWebsite';

export function AddSourceModal({ isOpen, siteId }: { isOpen: boolean, siteId: number }) {

  const { push } = useRouter();

  return (

    <Modal
      title="Add Source"
      description="Add source(s) for the bot."
      isOpen={isOpen}
      onClose={
        () => {
          push(`/dashboard/${siteId}/sources`)
        }
      }
    >

      <Tabs defaultValue="website">
        <TabsList>
          <TabsTrigger value="website"><div><Globe className="inline" /> Website</div></TabsTrigger>
          {/* <TabsTrigger value="upload"><div><FileUp className="inline" /> File Upload</div></TabsTrigger> */}
          <TabsTrigger value="input"><div><Text className="inline" /> Text Input</div></TabsTrigger>
        </TabsList>

        <TabsContent value="website" className="flex flex-col gap-y-4">
          <ScanWebsite siteId={siteId} />
          <AddSingularLink siteId={siteId} />

          <Alert variant="primary"  >
            <AlertDescription>
              You can configure the bot to automatically scan your added website urls for updated content on a regular basis.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="input" className="space-y-2" >
          <TextInput siteId={siteId} />
          <Alert variant="primary"  >
            <AlertDescription>
              This will add the text input source directly to the <strong>used</strong> sources.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

    </Modal>

  );
}


