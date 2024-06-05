import DashboardHeader from '@/components/layout/dashboardHeader';
import Sidebar from '@/components/layout/sidebar';
import { getSiteId, ignoreCache } from '@/lib/api';
import { getUserTasks } from '@/lib/tasks';
import type { LayoutProps } from "@/types";

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
        <Sidebar siteId={siteId} />
        <main className="w-full pt-16">{children}</main>
      </div>
    </>
  );
}
