
import BreadCrumb from '@/components/breadcrumb';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { AddedSources } from './(added)/AddedSources';
import { UsedSources } from './(used)/UsedSources';
import { PageProps } from '@/types';
import { getSiteId } from '@/lib/api';

const title = "Sources";
const description = "View sources for the bot";

export default async function page({ params }: PageProps) {
  const siteId = getSiteId(params);

  const breadcrumbItems = [{ title: 'Sources', link: `/dashboard/sources/${siteId}` }];

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex items-start justify-between">
          <Heading title={title} description={description} />
          <Link
            href={`/dashboard/${siteId}/sources/add`}
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </div>

        <Separator />

        <div className="flex sm:flex-row flex-col sm:gap-y-0 gap-y-2 sm:gap-x-8 justify-between">

          <div className="sm:w-6/12">
            <AddedSources siteId={siteId} />
          </div>

          <div className="sm:w-6/12">
            <UsedSources siteId={siteId} />
          </div>

        </div>

      </div>
    </ScrollArea>
  );
}


