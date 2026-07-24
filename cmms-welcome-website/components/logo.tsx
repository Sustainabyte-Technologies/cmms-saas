"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { APP_NAME, APP_SUBTITLE } from "@/lib/constants";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  textColor?: "foreground" | "white";
  imageSize?: number;
  showText?: boolean;
}

const sizeConfig = {
  sm: {
    containerSize: 32,
    scaleClass: "scale-[2.0]",
    marginClass: "ml-2",
  },
  md: {
    containerSize: 48,
    scaleClass: "scale-[2.2]",
    marginClass: "ml-3",
  },
  lg: {
    containerSize: 80,
    scaleClass: "scale-[2.8]",
    marginClass: "ml-6",
  },
  xl: {
    containerSize: 110,
    scaleClass: "scale-[3.0]",
    marginClass: "ml-8",
  },
};

export function Logo({
  href = "/",
  size = "md",
  showSubtitle = true,
  textColor = "foreground",
  imageSize,
  showText = true,
}: LogoProps) {
  const config = sizeConfig[size];
  const containerSize = imageSize || config.containerSize;

  return (
    <Link href={href} className="flex items-center w-fit group select-none">
      <div className="flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 overflow-visible">
        <Image
          src="/logo1.png"
          alt="Fixbyte Logo"
          width={containerSize}
          height={containerSize}
          priority
          className={cn("object-contain origin-center", config.scaleClass)}
        />
      </div>
      {showText && (
        <div className="flex flex-col justify-center leading-none overflow-visible">
          <div className={cn("flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 overflow-visible", config.marginClass)}>
            <Image
              src="/logo2.png"
              alt="Fixbyte Name"
              width={containerSize}
              height={containerSize}
              priority
              className={cn(
                "object-contain origin-center transition-all duration-200",
                config.scaleClass,
                textColor === "white" ? "invert dark:invert-0" : "dark:invert"
              )}
            />
          </div>
          {showSubtitle && APP_SUBTITLE && (
            <span 
              className={cn(
                "text-xs text-center w-full transition-colors duration-200 font-medium",
                config.marginClass
              )} 
              style={{ 
                color: textColor === "white" ? "rgba(255, 255, 255, 0.8)" : "var(--muted-foreground)",
                marginTop: size === "lg" ? "12px" : "4px"
              }}
            >
              {APP_SUBTITLE}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}


