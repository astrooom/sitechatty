import { Icons } from '@/components/icons';
export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export type RouteParams = { [key: string]: string | string[] | undefined };

export type RouteContext = { params?: RouteParams };

export type PageProps = {
  params?: RouteParams;
  searchParams?: RouteParams;
};

export type LayoutProps = {
  children: React.ReactNode;
  params?: RouteParams;
};