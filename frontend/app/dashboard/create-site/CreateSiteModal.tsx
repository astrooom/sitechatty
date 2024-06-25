"use client"

import { Modal } from '@/components/ui/modal';
import { useRouter } from 'next/navigation';
import { CreateSiteForm } from './CreateSiteForm';

export function CreateSiteModal({
  isOpen,
}: { isOpen: boolean }) {

  const { push } = useRouter();

  return (

    <Modal
      title="Add Site"
      description="Add a new site to your dashboard"
      isOpen={isOpen}
      onClose={
        () => {
          push(`/dashboard`)
        }
      }
    >

      <CreateSiteForm />

    </Modal>

  );
}


