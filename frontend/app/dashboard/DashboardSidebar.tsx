'use client';

import React, { useState } from 'react';
import { DashboardNav } from '@/components/dashboard-nav';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';
import { NavItem } from '@/types';

type SidebarProps = {
  dashboardItems: NavItem[]
  className?: string;
};

export default function DashboardSidebar({ className, dashboardItems }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();
  const [status, setStatus] = useState(false);

  const handleToggle = () => {
    setStatus(true);
    toggle();
    setTimeout(() => setStatus(false), 500);
  };


  return (
    <nav
      className={cn(
        `relative hidden h-screen border-r pt-20 md:block`,
        status && 'duration-500',
        !isMinimized ? 'w-72' : 'w-[72px]',
        className
      )}
    >
      <ChevronLeft
        className={cn(
          'absolute -right-3 top-[86px] cursor-pointer rounded-full border bg-background text-3xl text-foreground',
          !isMinimized && 'rotate-180'
        )}
        onClick={handleToggle}
      />

      <div className="px-3">
        <DashboardNav items={dashboardItems} />
      </div>

    </nav>
  );
}
