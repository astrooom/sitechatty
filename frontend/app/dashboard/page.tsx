import DashboardHeader from './DashboardHeader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardTitle, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Heading } from '@/components/ui/heading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, getSites } from '@/lib';
import capitalize from '@/lib/string';
import { ArrowLeft, ArrowRight, CircleSlash2, Info, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import DashboardSidebar from './DashboardSidebar';
import { getDashboardNavigation } from '@/constants/data';

export default async function page() {

  const title = "Select Site";
  const description = "Select site to continue";

  const { sites } = await getSites()

  const dashboardItems = getDashboardNavigation(sites)

  // If the user does not yet have a site, show the site creation guide.
  return (

    <>
      <DashboardHeader dashboardItems={dashboardItems} />
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar dashboardItems={dashboardItems} />
        <main className="w-full pt-16">
          <ScrollArea className="h-full">
            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
              <Alert variant="informative">
                <AlertDescription className="flex items-center gap-x-1"><Info className="inline h-5 w-5" />
                  A site is like an inbox for bot knowledge and chat history. Installing a chat widget on your website stores all knowledge and history for that site.
                </AlertDescription>
              </Alert>

              <Heading title={title} description={description} />

              {sites.length > 0 ? sites.map((site) => (
                <Card key={`site-${site.id}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between" >

                      <div>
                        {site?.favicon_url && <Image className="inline mr-2" src={site?.favicon_url} alt="Logo" width={32} height={32} />} {capitalize(site.name)}
                      </div>

                      <div className="hidden sm:block">Created at {new Date(site.created_at).toLocaleDateString()}</div>

                      <div>
                        <Link href={`/dashboard/${site.id}`} className={cn(buttonVariants({ variant: 'outline' }), "flex items-center whitespace-nowrap gap-x-1 group hover:text-foreground font-semibold cursor-pointer")}>
                          <p>Open</p> <ArrowRight className="size-4 text-muted-foreground translate-x-0 relative transition duration-150 ease-in-out group-hover:transition group-hover:text-foreground group-hover:duration-150 group-hover:ease-in-out group-hover:translate-x-1" />
                        </Link>
                      </div>

                    </CardTitle>
                  </CardHeader>
                </Card>
              )) : <div className="w-full flex justify-center">

                <EmptyState message="You have no sites created yet" icon={<CircleSlash2 />} />
              </div>}

              <div className="flex justify-end">
                <Link href="/dashboard/create-site"><Button><Plus className="mr-2 h-4 w-4" />Create Site</Button></Link>
              </div>

            </div>
          </ScrollArea>
        </main>
      </div>
    </>


  );
}
