import ThemeToggle from '@/components/layout/ThemeToggle/theme-toggle';
import Link from 'next/link';
import HeaderIcon from './headerIcon';

export default function AuthHeader() {
  return (
    <div className="supports-backdrop-blur:bg-background/60 fixed left-0 right-0 top-0 z-20 border-b bg-background/95 backdrop-blur">
      <nav className="flex h-14 items-center justify-between px-4">
        <div className="hidden lg:block">
          <Link
            href={'https://github.com/Kiranism/next-shadcn-dashboard-starter'}
            target="_blank"
          >
            <HeaderIcon />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
