import { DataTable } from '@/components/ui/data-table';
import { getSitesAddedSources } from '@/lib';
import { columns } from './AddedSourcesColumns';

export async function AddedSources() {
  const sites = await getSitesAddedSources(3);
  return (
    <div className="flex flex-col gap-y-4">
      <h2 className="text-xl font-bold tracking-tight">Added Sources</h2>
      <p className="text-sm text-muted-foreground">These sources have been added but are not yet used by the bot.</p>

      <DataTable searchKey="source" searchKeyName="added source" columns={columns} data={sites} />
    </div>
  );
}


