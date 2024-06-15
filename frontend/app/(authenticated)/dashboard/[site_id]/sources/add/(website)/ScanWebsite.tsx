"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { addSiteScanAction } from '@/lib/actions/tasks';
import { withQuery } from 'ufo';

const formSchema = z.object({
  url: z.string()
    .min(4, { message: 'URL must contain at least 4 characters' })
    .max(2083, { message: 'URL must not exceed 2083 characters' })
    .refine(
      (url) => {
        try {
          const { protocol } = new URL(url);
          return protocol === 'http:' || protocol === 'https:';
        } catch (e) {
          return false;
        }
      },
      { message: 'URL must contain a valid scheme (http:// or https://)' }
    ),
});

type TextInputFormValue = z.infer<typeof formSchema>;

export function ScanWebsite({ siteId }: { siteId: number }) {

  const [loading, setLoading] = useState(false);

  const { push } = useRouter();

  const { toast } = useToast();

  const form = useForm<TextInputFormValue>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: TextInputFormValue) => {
    setLoading(true);

    const response = await addSiteScanAction({ site_id: siteId, url: data.url });

    if (response.data.error) {
      toast({
        title: 'Error',
        description: response.data.error || 'An error occurred while starting the scan.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Started scan',
        description: response.data.message || undefined,
        variant: 'success',
      });
      push(withQuery(`/dashboard/${siteId}/sources`, {
        ongoingTasks: 'true'
      }));
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Scan Website <Search className="ml-1 inline w-5 h-5" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          Automatically scan available links on your website by entering the homepage URL.
        </p>
      </CardContent>
      <CardFooter>
        <div className="flex flex-col gap-3 w-full">

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-3 w-full"
            >
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                Start
              </Button>
            </form>
          </Form>
        </div>
      </CardFooter>
    </Card >

  );
}


