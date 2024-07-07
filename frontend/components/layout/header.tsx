import ThemeToggle from '@/components/layout/ThemeToggle/theme-toggle';
import { cn } from '@/lib/utils';

import Link from 'next/link';

import { buttonVariants } from '../ui/button';

import { User } from '@/lib/auth';
import LogoutButton from './logoutButton';
import Image from 'next/image';

type HeaderProps = {
  user?: User;
}

export default function Header({ user }: HeaderProps) {
  return (

    <>
      <div className="supports-backdrop-blur:bg-background/60 fixed left-0 right-0 top-0 z-20 bg-background/95 backdrop-blur">
        <nav className="flex h-14 items-center justify-around px-4">


          <div className="flex items-center gap-x-32">
            <Image src="/logo/rounded.svg" alt="Logo" width={42} height={42} />

            <div className="flex items-center gap-2">


              <Link href='/dashboard' className={cn(buttonVariants({ variant: 'default' }))}>Dashboard</Link>
              {user && <LogoutButton variant="warning" />}
            </div>
          </div>

        </nav>
      </div>

      <div className="absolute left-4 bottom-4">
        <ThemeToggle />
      </div>

    </>
  );
}
