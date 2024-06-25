'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { UsedSource } from '@/lib';
import { AlignHorizontalJustifyCenter, Edit, MinusCircle, MoreHorizontal, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UsedSourcesUnuseModal } from './UsedSourcesUnuseModal';
import { useToast } from '@/components/ui/use-toast';
import { unuseSiteSourceAction } from '@/lib/actions/tasks';
import Link from 'next/link';
import { isValidURL } from '@/lib/api';
import { UsedSourcesDeleteModal } from './UsedSourcesDeleteModal';

interface CellActionProps {
  siteId: number;
  data: UsedSource;
}

export const UsedSourcesCellAction: React.FC<CellActionProps> = ({ siteId, data }) => {
  const [loading, setLoading] = useState(false);
  const [unuseSourceOpen, setUnuseSourceOpen] = useState(false);
  const [deleteSourceOpen, setDeleteSourceOpen] = useState(false);
  const { refresh } = useRouter();
  const { toast } = useToast();

  const onUnuseSourceConfirm = async () => {
    setLoading(true);
    try {
      await unuseSiteSourceAction({
        source: data.source,  // Use the id from the data
        site_id: siteId
      });
      toast({
        title: `Unused "${data.source}"`,
        description: 'Removed source from being used by the bot.',
        variant: 'default'
      });
      refresh()
    } finally {
      setLoading(false);
      setUnuseSourceOpen(false);
    }
  };

  return (
    <>
      <UsedSourcesUnuseModal
        isOpen={unuseSourceOpen}
        onClose={() => setUnuseSourceOpen(false)}
        onConfirm={onUnuseSourceConfirm}
        loading={loading}
      />

      <UsedSourcesDeleteModal
        isOpen={deleteSourceOpen}
        onClose={() => setDeleteSourceOpen(false)}
        onConfirm={onUnuseSourceConfirm}
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

          {data.source_type === "input" ? (
            <DropdownMenuItem onClick={() => setDeleteSourceOpen(true)}>
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setUnuseSourceOpen(true)}>
              <MinusCircle className="mr-2 h-4 w-4" /> Unuse
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild >
            <Link href={`/dashboard/${siteId}/sources/${encodeURIComponent(data.source)}`} >

              {data.source_type === "input" ? (<>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </>
              ) : (
                <>
                  <AlignHorizontalJustifyCenter className="mr-2 h-4 w-4" /> Contents
                </>
              )}


            </Link>
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
