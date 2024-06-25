import ThemeToggle from '@/components/layout/ThemeToggle/theme-toggle';
import { cn } from '@/lib/utils';
import { MobileSidebar } from './SiteDashboardMobileSidebar';
import { UserNav } from '../../../../components/layout/user-nav';
import Link from 'next/link';
import HeaderIcon from '../../../../components/layout/headerIcon';
import type { CeleryTask } from '@/lib/tasks';
import { TaskList } from '../../../../components/layout/taskList';
import { TooltipProvider } from '@/components/ui/tooltip';
import Image from 'next/image';

export default function DashboardHeader({ siteId, tasks }: { siteId: number, tasks: CeleryTask[] }) {
  return (
    <div className="supports-backdrop-blur:bg-background/60 fixed left-0 right-0 top-0 z-20 border-b bg-background/95 backdrop-blur">
      <nav className="flex h-14 items-center justify-between px-4">

        <div
          className="hidden lg:block"
        >
          <Link
            href="/dashboard"
            className="flex gap-x-2 items-center"
          >
            {/* <HeaderIcon /> */}

            <Image src="/logo/rounded.svg" alt="Logo" width={38} height={38} />
            <p className="text-lg text-bold">SiteChatty</p>
          </Link>
        </div>

        {siteId && <MobileSidebar className="block lg:!hidden" siteId={siteId} />}

        <div className="flex items-center gap-2">
          {/* <UserNav /> */}

          {siteId && (
            <TooltipProvider>
              <TaskList tasks={tasks} />
            </TooltipProvider>
          )}

          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
