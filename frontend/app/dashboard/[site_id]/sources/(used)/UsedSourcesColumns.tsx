"use client"

import { ColumnDef } from '@tanstack/react-table';
import { UsedSourcesCellAction } from './UsedSourcesCellAction';
import { Checkbox } from '@/components/ui/checkbox';
import type { UsedSource } from '@/lib';

export const getColumns = (siteId: number): ColumnDef<UsedSource>[] => [
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
    enableHiding: false,
  },
  {
    id: 'source',
    accessorKey: 'source',
    header: 'SOURCE',
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at_datetime',
    header: 'UPDATED AT',
    cell: ({ row }) => {
      const value: string = row.getValue('updated_at'); // This should be in 'YYYY-MM-DDTHH:MM:SSZ' format.
      const date = new Date(value);
      return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
        timeZone: 'UTC'
      });
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <UsedSourcesCellAction siteId={siteId} data={row.original} />,
  },
];