import Header from '@/components/layout/header';
import { getCurrentUser } from '@/lib/auth';
export default async function HomeLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <>

      {/* Stylistic "blurs" for the background */}
      <div className="pointer-events-none absolute inset-x-0 transform-gpu overflow-hidden blur-3xl sm:-top-80 z-[21]" aria-hidden="true"><div className="relative left-[calc(50%)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-fuchsia-100 to-fuchsia-400 opacity-30 dark:opacity-17 sm:left-[calc(25%-25rem)] sm:w-[72.1875rem]" ></div></div>
      <div className="pointer-events-none absolute inset-x-0 transform-gpu overflow-hidden blur-3xl sm:-bottom-80 z-[21]" aria-hidden="true"><div className="relative left-[calc(50%)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-fuchsia-100 to-fuchsia-400 opacity-30 dark:opacity-17 sm:left-[calc(90%-25rem)] sm:w-[72.1875rem]" ></div></div>

      <Header user={user} />
      <div className="flex h-screen overflow-hidden">
        <main className="w-full pt-16">{children}</main>
      </div>
    </>
  );
}
