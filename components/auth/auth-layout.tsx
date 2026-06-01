import Link from "next/link";
import { Wrench } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

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
      <div className="hidden w-1/2 bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20">
            <Wrench className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-primary-foreground">{APP_NAME}</span>
        </Link>

        <div className="space-y-6">
          <blockquote className="text-xl font-medium text-primary-foreground/90 leading-relaxed">
            &ldquo;MaintainX Pro has transformed how we manage our maintenance operations. 
            The intuitive interface and powerful features have helped us reduce downtime by 40%.&rdquo;
          </blockquote>
          <div>
            <p className="font-semibold text-primary-foreground">Sarah Johnson</p>
            <p className="text-sm text-primary-foreground/70">Operations Director, Tech Manufacturing Inc.</p>
          </div>
        </div>

        <p className="text-sm text-primary-foreground/60">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Wrench className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">{APP_NAME}</span>
            </Link>
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
