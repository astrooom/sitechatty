import { getUser } from "@/lib/user";
import type { LayoutProps } from "@/types";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: LayoutProps) {

  // redirect to login if user is not authenticated
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
} 