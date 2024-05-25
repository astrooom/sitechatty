import ThemeToggle from '@/components/layout/ThemeToggle/theme-toggle';
import { cn } from '@/lib/utils';
import { MobileSidebar } from './mobile-sidebar';
import { UserNav } from './user-nav';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button, buttonVariants } from '../ui/button';
import HeaderIcon from './headerIcon';
import { User } from '@/lib/auth';
import LogoutButton from './logoutButton';

type HeaderProps = {
  user?: User;
}

export default function Header({ user }: HeaderProps) {
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
          {/* <UserNav /> */}

          {/* <Link href='/dashboard' className={cn(buttonVariants({ variant: 'default' }))}>Dashboard</Link> */}

          {user ? (
            <LogoutButton />
          ) :
            <Link href='/auth/login' className={cn(buttonVariants({ variant: 'default' }))}>Log In</Link>
          }


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="text">Hello</Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    test
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    test
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  Profile
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Billing
                  <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Settings
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>New Team</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />


        </div>
      </nav>
    </div>
  );
}
