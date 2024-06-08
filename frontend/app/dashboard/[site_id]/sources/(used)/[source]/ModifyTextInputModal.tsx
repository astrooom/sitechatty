'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { ModifyTextInput } from './ModifyTextInput';
import { useRouter } from 'next/navigation';

export const ModifyTextInputModal = ({ siteId, currentTitle, currentContents }: { siteId: number, currentTitle: string, currentContents: string }) => {

  const { push } = useRouter()

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title={`Edit "${currentTitle}"`}
      description="Edit the text input source."
      isOpen={true}
      onClose={
        () => {
          push(`/dashboard/${siteId}/sources`)
        }
      }
    >
      <ModifyTextInput siteId={siteId} currentTitle={currentTitle} currentContents={currentContents} />
    </Modal>
  );
};
