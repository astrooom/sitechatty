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
      <Header user={user} />
      <div className="flex h-screen overflow-hidden">
        <main className="w-full pt-16">{children}</main>
      </div>
    </>
  );
}
