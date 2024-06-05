"use client"

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import * as z from 'zod';
import { Textarea } from "@/components/ui/textarea";
import { LONGFORM_TEXT_MAX } from "@/lib/validation";
import { addUsedSourcesTextInputAction } from "@/lib/actions/tasks";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  title: z.string().min(4).max(80),
  content: z.string().min(4).max(LONGFORM_TEXT_MAX)
});

type TextInputFormValue = z.infer<typeof formSchema>;

export function TextInput({ siteId }: { siteId: number }) {

  const { toast } = useToast();

  const { refresh } = useRouter()

  const [loading, setLoading] = useState(false);

  const form = useForm<TextInputFormValue>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: TextInputFormValue) => {
    setLoading(true)

    const response = await addUsedSourcesTextInputAction({
      site_id: siteId,
      title: data.title,
      content: data.content
    })

    if (response.data.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.data.error
      });
    } else {
      toast({
        title: 'Source added',
        description: 'The source was added successfully.',
        variant: 'success'
      });

      refresh()
    }
    setLoading(false)
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-4 w-full"
        >
          <Button disabled={loading} className="ml-auto" type="submit">
            Add Source
          </Button>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter title. Must be unique..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    rows={16}
                    placeholder="Enter content..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  );
}


