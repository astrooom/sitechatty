"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { addSiteAddedWebpageAction } from '@/lib/actions/tasks';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { withQuery } from "ufo";
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';

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

export function AddSingularLink({ siteId }: { siteId: number }) {

  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const { push } = useRouter();

  const form = useForm<TextInputFormValue>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: TextInputFormValue) => {
    setLoading(true);

    const response = await addSiteAddedWebpageAction({ site_id: siteId, url: data.url });

    if (response.data.error) {
      toast({
        title: 'Error',
        description: response.data.error || 'An error occurred while adding the source.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Source added',
        description: response.data.message || 'The source was added successfully.',
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
          Add Singular Link
        </CardTitle>
      </CardHeader>
      <CardContent >
        <p>
          Add a singular URL from your website.
        </p>
      </CardContent>
      <CardFooter>

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
                      placeholder="https://example.com/knowledgebase/how-to-start"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              Add
            </Button>
          </form>
        </Form>

      </CardFooter>
    </Card>

  );
}


