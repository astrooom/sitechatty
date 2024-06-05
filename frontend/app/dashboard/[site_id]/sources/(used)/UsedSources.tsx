import { getSitesUsedSources } from '@/lib';
import { UsedSourcesTable } from './UsedSourcesTable';
import { ignoreCache } from '@/lib/api';
export async function UsedSources({ siteId }: { siteId: number }) {
  const usedSources = await getSitesUsedSources(siteId, ignoreCache);
  return (
    <div className="flex flex-col gap-y-4">
      <h2 className="text-xl font-bold tracking-tight">Used Sources</h2>
      <p className="text-sm text-muted-foreground">These sources are currently used by the bot.</p>

      <UsedSourcesTable siteId={siteId} usedSources={usedSources} />
    </div>
  );
}


