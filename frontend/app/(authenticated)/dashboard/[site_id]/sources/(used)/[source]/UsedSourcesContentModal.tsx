'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UsedSourcesContentModalProp {
  siteId: number;
  source: string;
  contents: string;
  isOpen: boolean;
}

export const UsedSourcesContentModal: React.FC<UsedSourcesContentModalProp> = ({
  siteId,
  source,
  contents,
  isOpen,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const { push } = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title={`Contents of "${decodeURIComponent(source)}"`}
      description="This information is split up into chunks to make the lookup faster for the AI-model."
      isOpen={isOpen}
      onClose={() => {
        push(`/dashboard/${siteId}/sources`)
      }}
    >
      <ScrollArea className="h-[calc(80vh-220px)] p-1 border rounded-md">
        <pre className="whitespace-pre-wrap break-words">
          <code>{contents}</code>
        </pre>
      </ScrollArea>
    </Modal>
  );
};
