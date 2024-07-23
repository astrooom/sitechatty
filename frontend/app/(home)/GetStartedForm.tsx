'use client';

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
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { testScanUrlAction } from '@/lib/actions/tasks';

const formSchema = z.object({
  url: z.string().url()
});

type GetStartedFormValue = z.infer<typeof formSchema>;

export function GetStartedForm() {
  const { push, refresh } = useRouter();

  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const form = useForm<GetStartedFormValue>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: GetStartedFormValue) => {
    setLoading(true);

    const response = await testScanUrlAction({ url: data.url });

    const questions = response?.data?.questions;

    if (response?.data?.error) {
      toast({
        title: 'Error',
        description:
          response.data.error || 'An error occurred while adding the source.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Generated Questions',
        variant: 'success'
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormMessage />

              <div className="flex w-full items-center gap-x-4">
                <FormControl className="w-9/12">
                  <Input
                    type="name"
                    placeholder="https://example.com"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>

                <Button
                  disabled={loading}
                  className="h-9 w-3/12 bg-gradient-to-r from-fuchsia-600 to-indigo-600 dark:from-indigo-300 dark:to-fuchsia-300"
                  type="submit"
                >
                  Get Started Now
                </Button>
              </div>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
