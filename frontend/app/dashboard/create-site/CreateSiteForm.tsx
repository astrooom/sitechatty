"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel
} from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


const formSchema = z.object({
  name: z.string().min(1, { message: 'Enter a name' }),
});

type CreateSiteFormValue = z.infer<typeof formSchema>;

export function CreateSiteForm() {

  const { push, refresh } = useRouter()

  const { toast } = useToast()

  const [loading, setLoading] = useState(false);


  const form = useForm<CreateSiteFormValue>({
    resolver: zodResolver(formSchema),
  });
  const onSubmit = async (formData: CreateSiteFormValue) => {
    setLoading(true);

    const response = await fetch('/api/sites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const { data, error } = await response.json();

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Site created successfully',
      });
    }

    setLoading(false);

    if (data.id) {
      push(`/dashboard/${data.id}`);
    } else {
      refresh()
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4 w-full"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  type="name"
                  placeholder="Enter site name..."
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={loading} className="ml-auto w-full" type="submit">
          Create
        </Button>
      </form>
    </Form>
  )

}