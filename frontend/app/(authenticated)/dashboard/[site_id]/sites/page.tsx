import {
  Card,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getSites } from '@/lib';

export default async function page() {

  const title = "Sites";
  const description = "Manage your sites";

  const { sites } = await getSites()

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Heading title={title} description={description} />

        {sites.map((site) => (
          <Card key={site.id}>
            <CardHeader>
              <CardTitle>{site.name}</CardTitle>
              {/* <CardDescription>
                {site.url}
              </CardDescription> */}
            </CardHeader>
          </Card>
        ))}

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Now
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card> */}

      </div>

    </ScrollArea>

  );
}
