"use client"

import { ColumnDef } from '@tanstack/react-table';
import { UsedSourcesCellAction } from './UsedSourcesCellAction';
import { Checkbox } from '@/components/ui/checkbox';
import type { UsedSource } from '@/lib';
import { Globe, Text } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    id: 'source_type',
    accessorKey: 'source_type',
    header: 'TYPE',
    cell: ({ row }) => {
      const sourceType = row.getValue("source_type");
      return (
        <Tooltip>
          <TooltipContent align="center" side="right">
            {sourceType === "input" ? "Text Input" : "Webpage"}
          </TooltipContent>
          <TooltipTrigger>
            {sourceType === "input" ? (
              <Text className="inline h-6 w-6" />
            ) : sourceType === "webpage" ? (
              <Globe className="inline h-6 w-6" />
            ) : (
              null
            )}
          </TooltipTrigger>
        </Tooltip>
      );
    }
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