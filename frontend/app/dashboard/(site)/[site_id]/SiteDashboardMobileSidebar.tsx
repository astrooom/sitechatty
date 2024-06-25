'use client';

import { DashboardNav } from '@/components/dashboard-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { getDashboardSiteNavigation } from '@/constants/data';
import { ArrowLeft, MenuIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// import { Playlist } from "../data/playlists";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  siteId: number;
}

export function MobileSidebar({ siteId, className }: SidebarProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={className}>
      <Sheet open={open} onOpenChange={setOpen} >
        <SheetTrigger asChild>
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left" className="!px-0">

          <div className="space-y-4 py-4">

            <Link className="whitespace-nowrap flex items-center space-x-1 group px-4 flex-nowrap text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer" href="/dashboard">
              <ArrowLeft className="size-4 text-muted-foreground translate-x-0 relative transition duration-150 ease-in-out group-hover:transition group-hover:text-foreground group-hover:duration-150 group-hover:ease-in-out group-hover:-translate-x-1" />
              <p>Choose Site</p>
            </Link>

            <div className="px-3 py-2">

              <div className="space-y-1">

                <DashboardNav
                  items={getDashboardSiteNavigation(siteId)}
                  isMobileNav={true}
                  setOpen={setOpen}
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
