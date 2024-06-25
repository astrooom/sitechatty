'use client';

import { DashboardNav } from '@/components/dashboard-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { getDashboardNavigation } from '@/constants/data';
import type { NavItem } from '@/types';
import { MenuIcon } from 'lucide-react';
import { useState } from 'react';


interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  dashboardItems: NavItem[];
}

export function MobileSidebar({ dashboardItems, className }: SidebarProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={className}>
      <Sheet open={open} onOpenChange={setOpen} >
        <SheetTrigger asChild>
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left" className="!px-0">

          <div className="space-y-4 py-4">

            <div className="px-3 py-2">

              <div className="space-y-1">

                <DashboardNav
                  items={dashboardItems}
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
