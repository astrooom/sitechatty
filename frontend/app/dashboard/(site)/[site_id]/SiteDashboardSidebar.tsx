'use client';

import React, { useState } from 'react';
import { DashboardNav } from '@/components/dashboard-nav';
import { getDashboardSiteNavigation } from '@/constants/data';
import { cn } from '@/lib/utils';
import { ArrowLeft, ChevronLeft, MoveLeft } from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';
import Link from 'next/link';

type SidebarProps = {
  siteId: number;
  className?: string;
};

export default function SiteDashboardSidebar({ siteId, className }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();
  const [status, setStatus] = useState(false);

  const handleToggle = () => {
    setStatus(true);
    toggle();
    setTimeout(() => setStatus(false), 500);
  };

  const dashboardItems = getDashboardSiteNavigation(siteId)

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

      {!isMinimized ? (
        <Link className="whitespace-nowrap absolute top-[67px] flex items-center space-x-1 group px-4 flex-nowrap text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer" href="/dashboard">
          <ArrowLeft className="size-4 text-muted-foreground translate-x-0 relative transition duration-150 ease-in-out group-hover:transition group-hover:text-foreground group-hover:duration-150 group-hover:ease-in-out group-hover:-translate-x-1" />
          <p>Choose Site</p>
        </Link>
      ) : (
        <Link className="whitespace-nowrap absolute top-[67px] flex items-center space-x-1 group px-6 flex-nowrap text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer" href="/dashboard">
          <ArrowLeft className="size-4 text-muted-foreground translate-x-0 relative transition duration-150 ease-in-out group-hover:transition group-hover:text-foreground group-hover:duration-150 group-hover:ease-in-out group-hover:-translate-x-1" />
        </Link>
      )}

      <div className="px-3 my-[12px]">
        <DashboardNav items={dashboardItems} />
      </div>
    </nav>
  );
}
