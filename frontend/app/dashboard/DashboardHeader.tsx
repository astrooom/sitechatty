import ThemeToggle from '@/components/layout/ThemeToggle/theme-toggle';
import { MobileSidebar } from './DashboardMobileSidebar';
import Link from 'next/link';
import Image from 'next/image';
import { NavItem } from '@/types';

export default function DashboardHeader({ dashboardItems }: {
  dashboardItems: NavItem[]
}) {
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

        <MobileSidebar className="block lg:!hidden" dashboardItems={dashboardItems} />

        <div className="flex items-center gap-2">
          {/* <UserNav /> */}

          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
