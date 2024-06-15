import { redirect } from 'next/navigation';

export default async function page() {
  // Redirect to selected site on dashboard.
  redirect("/dashboard/3")
}
