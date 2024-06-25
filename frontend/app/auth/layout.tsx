import ThemeToggle from "@/components/layout/ThemeToggle/theme-toggle";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <Link className="relative z-20 flex items-center text-lg font-medium" href="/">
          <Image src="/logo/rounded.svg" alt="Logo" width={64} height={64} />
          <p className="ml-1 text-bold">SiteChatty</p>
        </Link>
        <div className="relative z-20 mt-auto">
          <p className="text-lg">
            Empowering your customer support with instant, intelligent, and personalized responses, 24/7.
          </p>
        </div>
      </div>
      <div className="flex h-full items-center p-4 lg:p-8">
        <div className={
          // Place top right and do not interfere with children
          "absolute top-4 right-4 lg:top-6 lg:right-6"}>
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  );
}
