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
}

const sizeConfig = {
  sm: { image: 24, text: "text-sm" },
  md: { image: 36, text: "text-base" },
  lg: { image: 48, text: "text-lg" },
  xl: { image: 64, text: "text-2xl" },
};

export function Logo({ 
  href = "/", 
  size = "md", 
  showSubtitle = true,
  textColor = "foreground",
  imageSize
}: LogoProps) {
  const sizeConfig_ = sizeConfig[size];
  const imageDimension = imageSize || sizeConfig_.image;
  const textColorClass = textColor === "white" ? "text-white" : "text-foreground";
  const subtitleColorClass = textColor === "white" ? "text-white/80" : "text-muted-foreground";

  return (
    <Link href={href} className="flex items-center gap-3 w-fit">
      <div className="flex items-center justify-center shrink-0">
        <Image 
          src="/logo.png" 
          alt="Fixbyte Logo" 
          width={imageDimension} 
          height={imageDimension}
          priority
        />
      </div>
      <div className="flex flex-col">
        <span className={`${sizeConfig_.text} font-bold ${textColorClass}`}>
          {APP_NAME}
        </span>
        {showSubtitle && (
          <span className="text-xs" style={{ color: textColor === "white" ? "rgba(255, 255, 255, 0.8)" : "var(--muted-foreground)" }}>
            {APP_SUBTITLE}
          </span>
        )}
      </div>
    </Link>
  );
}
