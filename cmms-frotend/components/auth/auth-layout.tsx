import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Logo } from "@/components/logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showBackLink?: boolean;
}

export function AuthLayout({ children, title, subtitle, showBackLink = true }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#81C816] to-[#81C816] lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="flex flex-col items-center justify-center space-y-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <Logo href="/" size="xl" imageSize={200} showText={false} showSubtitle={false} textColor="white" />
            <div>
              <h2 className="text-5xl font-bold text-white">{APP_NAME}</h2>
            </div>
          </div>

          <blockquote className="text-lg font-medium text-white/90 leading-relaxed max-w-md border-l-4 border-white/30 pl-6">
            &ldquo;Fixbyte has transformed how we manage our maintenance operations. The intuitive interface and powerful features have helped us reduce downtime by 40%.&rdquo;
          </blockquote>

          <div>
            <p className="font-semibold text-white">Sarah Johnson</p>
            <p className="text-sm text-white/70">Operations Director, Tech Manufacturing Inc.</p>
          </div>
        </div>

        <p className="absolute bottom-6 text-sm text-white/60">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden">
            <Logo href="/" size="lg" showSubtitle />
          </div>

          {showBackLink && (
            <Link
              href="/"
              className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Back to home
            </Link>
          )}

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
