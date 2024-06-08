'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScannedUrl } from '@/lib';
import { deleteAddedSourceAction, useSiteSourceAction } from '@/lib/actions/tasks';
import { MoreHorizontal, PlusCircle, Trash } from 'lucide-react';

import { useState } from 'react';
import { AddedSourcesUseModal } from './AddedSourcesUseModal';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { AddedSourcesDeleteModal } from './AddedSourcesDeleteModal';

interface CellActionProps {
  data: ScannedUrl;
}

export const AddedSourcesCellAction: React.FC<CellActionProps> = ({ data }) => {

  const { refresh } = useRouter()

  const { toast } = useToast()

  const [loading, setLoading] = useState(false);
  const [useOpen, setUseOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const onConfirmUse = async () => {
    setLoading(true);
    try {
      await useSiteSourceAction({
        added_source_id: data.id,  // Use the id from the data
        site_id: data.site_id
      });
      refresh()

      toast({
        title: 'Adding source',
        description: 'Scanning source URL for contents...',
        variant: 'default'
      });

    } finally {
      setLoading(false);
      setUseOpen(false);
    }
  };

  const onConfirmDelete = async () => {
    setLoading(true);
    try {
      const response = await deleteAddedSourceAction({
        added_source_id: data.id,  // Use the id from the data
        site_id: data.site_id
      });
      if (response.data.error) {
        toast({
          title: 'Error',
          description: response.data.error ?? 'Error deleting source.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Success',
          description: 'Source deleted.',
          variant: 'success'
        });
      }
      refresh()
    } finally {
      setLoading(false);
      setDeleteOpen(false);
    }
  };

  return (
    <>
      <AddedSourcesUseModal
        isOpen={useOpen}
        onClose={() => setUseOpen(false)}
        onConfirm={onConfirmUse}
        loading={loading}
      />

      <AddedSourcesDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onConfirmDelete}
        loading={loading}
      />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => setUseOpen(true)}
            disabled={data.is_used}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Use
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
          // disabled={data.is_used}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
