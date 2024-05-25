"use client";

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
export default function LogoutButton() {
  const { refresh } = useRouter();
  const { toast } = useToast();

  const doLogout = async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    })

    const { error } = await response.json();
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! There was a problem logging out.',
        description: error
      });
    } else {
      toast({
        variant: 'default',
        title: 'Logged out!',
      });

      refresh();
    }
  };

  return (
    <Button onClick={
      () => {
        doLogout()
      }
    } variant="default">Log out</Button>
  );
}
