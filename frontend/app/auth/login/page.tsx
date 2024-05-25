import Link from 'next/link';
import UserAuthForm from '@/components/forms/user-register-form';
import UserLoginForm from '@/components/forms/user-login-form';

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
    <div className="flex flex-col space-y-2 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Login to your account
      </h1>
      <p className="text-sm text-muted-foreground">
        Enter your email and password below to access your account
      </p>
    </div>
    <UserLoginForm />

    <p className="px-8 text-center text-sm text-muted-foreground">
      Don't have an account?{' '}
      <Link
        href="/auth/register"
        className="underline underline-offset-4 hover:text-primary"
      >
        Sign Up
      </Link>.

    </p>

  </div>
  );
}
