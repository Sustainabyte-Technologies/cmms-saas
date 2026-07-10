"use client";

import Link from "next/link";
import Image from "next/image";
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
  sm: { image: 24, text: "text-sm" },
  md: { image: 36, text: "text-base" },
  lg: { image: 85, text: "text-2xl" },
  xl: { image: 72, text: "text-4xl" },
};

export function Logo({
  href = "/",
  size = "md",
  showSubtitle = true,
  textColor = "foreground",
  imageSize,
  showText = true,
}: LogoProps) {
  const sizeConfig_ = sizeConfig[size];
  const imageDimension = imageSize || sizeConfig_.image;
  const textColorClass = textColor === "white" ? "text-white" : "text-foreground";

  return (
    <Link href={href} className="flex items-center gap-2.5 w-fit group">
      <div className="flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
        <Image
          src="/fixbyte.png"
          alt="Fixbyte Logo"
          width={imageDimension}
          height={imageDimension}
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span className={`${sizeConfig_.text} font-extrabold tracking-tight ${textColorClass} transition-colors duration-200`}>
            {APP_NAME}
          </span>
          {showSubtitle && APP_SUBTITLE && (
            <span className="text-xs mt-0.5" style={{ color: textColor === "white" ? "rgba(255, 255, 255, 0.8)" : "var(--muted-foreground)" }}>
              {APP_SUBTITLE}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

