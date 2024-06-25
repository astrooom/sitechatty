'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Icons } from '@/components/icons';
import { cn, stopDefaultAction } from '@/lib/utils';
import { NavItem } from '@/types';
import { Dispatch, SetStateAction } from 'react';
import { useSidebar } from '@/hooks/useSidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip';
import { DashboardNavLogoutButton } from './dashboardNavLogoutButton';
import { ChevronRight } from 'lucide-react';

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
  isMobileNav?: boolean;
}

export function DashboardNav({
  items,
  setOpen,
  isMobileNav = false
}: DashboardNavProps) {

  const path = usePathname();
  const { isMinimized } = useSidebar();

  const [peekItems, setPeekItems] = useState<Record<number, boolean>>({});

  const handleToggleSubItems = (index: number) => {
    setPeekItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="grid items-start gap-2">
      <TooltipProvider>
        {items.map((item, index) => {
          const Icon = Icons?.[item?.icon || 'arrowRight'];
          // const hasSubItems = item.subItems && item.subItems.length > 0;
          const hasSubItems = item.subItems && !isMinimized

          // If index is 0 (the main dashboard item without a path), check for exact match instead of starting with
          const isOpened = index === 0 ? path === item.href : path.startsWith(item.href)
          return (
            <div key={`nav-item-${index}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.disabled ? '/' : item.href}
                    className={cn(
                      'flex items-center gap-2 overflow-hidden rounded-md py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                      isOpened ? 'bg-accent' : 'transparent',
                      item.disabled && 'cursor-not-allowed opacity-80',
                      hasSubItems ? 'pr-4' : '' // Add padding for toggle icon
                    )}
                    onClick={() => {
                      if (setOpen) setOpen(false);
                      if (hasSubItems) {
                        handleToggleSubItems(index);
                      }
                    }}
                  >
                    <Icon className={`ml-3 size-5`} />
                    {isMobileNav || (!isMinimized && !isMobileNav) ? (
                      <span className="mr-2 truncate">{item.title}</span>
                    ) : (
                      ''
                    )}
                    {hasSubItems && (
                      <ChevronRight
                        onClick={(e) => {
                          stopDefaultAction(e);

                          handleToggleSubItems(index);
                        }}
                        className={cn(
                          'h-5 w-5 ml-auto transition-transform',
                          (peekItems[index] || isOpened) ? 'rotate-90' : '',
                          !isOpened && "hover:text-muted-foreground"
                        )}
                      />
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  align="center"
                  side="right"
                  sideOffset={8}
                  className={!isMinimized ? 'hidden' : 'inline-block'}
                >
                  {item.title}
                </TooltipContent>
              </Tooltip>

              {hasSubItems && (peekItems[index] || path.startsWith(item.href)) && (
                <div className="ml-5 my-1">
                  {item.subItems!.map((subItem, subIndex) => {

                    const Icon = Icons?.[subItem?.icon!];

                    return (
                      <div className="py-0.5 border-l border-primary/15" key={`sub-nav-item-${index}-${subIndex}`}>

                        <Tooltip key={`${index}-${subIndex}`}>
                          <TooltipTrigger asChild>
                            <Link
                              href={subItem.disabled ? '/' : subItem.href}
                              className={cn(
                                'ml-4 flex items-center gap-2 overflow-hidden rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                                path === subItem.href ? 'bg-accent' : 'transparent',
                                subItem.disabled && 'cursor-not-allowed opacity-80'
                              )}
                              onClick={() => {
                                if (setOpen) setOpen(false);
                              }}
                            >

                              {Icon && <Icon className={`ml-3 size-4`} />}

                              {isMobileNav || (!isMinimized && !isMobileNav) ? (
                                <span className="mr-2 truncate">{subItem.title}</span>
                              ) : (
                                ''
                              )}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent
                            align="center"
                            side="right"
                            sideOffset={8}
                            className={!isMinimized ? 'hidden' : 'inline-block'}
                          >
                            {subItem.title}
                          </TooltipContent>
                        </Tooltip>

                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          );
        })}
        <DashboardNavLogoutButton isMobileNav={isMobileNav} />
      </TooltipProvider>
    </div>
  );
}
