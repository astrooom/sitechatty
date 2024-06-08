'use client';

import { ColumnDef } from '@tanstack/react-table';
import { AddedSourcesCellAction } from './AddedSourcesCellAction';

import { Checkbox } from '@/components/ui/checkbox';
import { ScannedUrl } from '@/lib';
import { Check, X } from 'lucide-react';

export const columns: ColumnDef<ScannedUrl>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'source',
    accessorKey: 'source',
    header: 'SOURCE'
  },
  // {
  //   id: 'source_type',
  //   accessorKey: 'source_type',
  //   header: 'TYPE',
  // },
  {
    id: 'type',
    accessorKey: 'type',
    header: 'CATEGORY',
    // cell: ({ row }) => <>{row.original.type || 'n/a'}</>
  },
  {
    id: 'is_used',
    accessorKey: 'is_used',
    header: 'USED',
    cell: ({ row }) => <>{row.original.is_used ? <Check className="text-green-500 h-5 w-5" /> : <X className="text-red-500 h-5 w-5" />}</>
  },
  {
    id: 'actions',
    cell: ({ row }) => <AddedSourcesCellAction data={row.original} />
  }
];
