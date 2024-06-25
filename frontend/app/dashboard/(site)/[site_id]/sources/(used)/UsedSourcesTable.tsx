"use client"

import { DataTable } from '@/components/ui/data-table';
import { getColumns } from './UsedSourcesColumns';
import { UsedSource } from '@/lib';
import { useMemo } from 'react';
export function UsedSourcesTable({ siteId, usedSources }: { siteId: number, usedSources: UsedSource[] }) {
  const currentUsedSources = useMemo(() => usedSources, [usedSources]);
  return (
    <DataTable searchKey="source" searchKeyName="used source" columns={getColumns(siteId)} data={currentUsedSources} defaultSortingState={[{ id: "updated_at", desc: true }]} />
  );
}


