import DashboardHeader from './SiteDashboardHeader';
import { getSiteId, ignoreCache } from '@/lib/api';
import { getUserTasks } from '@/lib/tasks';
import type { LayoutProps } from "@/types";
import SiteDashboardSidebar from './SiteDashboardSidebar';

export default async function DashboardLayout({
  params,
  children
}: LayoutProps) {
  const siteId = getSiteId(params);
  const tasks = await getUserTasks(ignoreCache);

  return (
    <>
      <DashboardHeader siteId={siteId} tasks={tasks} />

      <div className="flex h-screen overflow-hidden">

        <SiteDashboardSidebar className="hidden lg:block" siteId={siteId} />

        <main className="w-full pt-16">{children}</main>
      </div>
    </>
  );
}
