'use client';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/hooks/useSidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from './ui/tooltip';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { LogOut } from 'lucide-react';

interface DashboardNavLogoutButtonProps {
  isMobileNav?: boolean;
}

export function DashboardNavLogoutButton({
  isMobileNav = false
}: DashboardNavLogoutButtonProps) {
  const { isMinimized } = useSidebar();
  const { toast } = useToast();
  const { refresh } = useRouter();

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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="link"
          className={
            'flex justify-start items-center gap-2 overflow-hidden rounded-md py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground shadow-none'
          }
          onClick={() => {
            doLogout();
          }}
        >
          <LogOut className={`size-5`} />

          {isMobileNav || (!isMinimized && !isMobileNav) ? (
            <span className="mr-2 truncate">Log out</span>
          ) : (
            ''
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent
        align="center"
        side="right"
        sideOffset={8}
        className={!isMinimized ? 'hidden' : 'inline-block'}
      >
        Log out
      </TooltipContent>
    </Tooltip>
  );
}
