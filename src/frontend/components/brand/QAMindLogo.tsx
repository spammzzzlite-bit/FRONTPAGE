import { cn } from "@/frontend/store/utils";

export type QAMindLogoVariant = "auto" | "onDark" | "onLight";

const sizeStyles: Record<"sm" | "md" | "lg" | "xl", string> = {
  sm: "text-lg",
  md: "text-[20px]",
  lg: "text-[22px]",
  xl: "text-3xl",
};

const variantStyles: Record<QAMindLogoVariant, string> = {
  auto: "text-[var(--c-text)]",
  onDark: "text-[#ECE3D6]",
  onLight: "text-[#242428]",
};

type QAMindLogoProps = {
  variant?: QAMindLogoVariant;
  size?: keyof typeof sizeStyles;
  className?: string;
  /** Use brand image asset instead of text wordmark */
  image?: boolean;
};

export function QAMindLogo({
  variant = "auto",
  size = "md",
  className,
  image = false,
}: QAMindLogoProps) {
  if (image) {
    const src = variant === "onLight" ? "/brand/logo-on-light.png" : "/brand/logo-on-dark.png";
    const heights = { sm: 24, md: 28, lg: 32, xl: 40 };
    return (
      <img
        src={src}
        alt="QAMind AI"
        className={cn("min-w-[96px] w-auto object-contain", className)}
        style={{ height: heights[size] }}
        width={heights[size] * 4}
        height={heights[size]}
      />
    );
  }

  return (
    <span
      className={cn(
        "font-display font-semibold tracking-normal inline-block min-w-[96px]",
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
    >
      QAMind <span className="text-[var(--c-accent)]">AI</span>
    </span>
  );
}

type QAMindAppIconProps = {
  variant?: "primary" | "dark" | "light";
  size?: number;
  className?: string;
};

const appIconSrc: Record<NonNullable<QAMindAppIconProps["variant"]>, string> = {
  primary: "/brand/appicon-primary.png",
  dark: "/brand/appicon-dark.png",
  light: "/brand/appicon-light.png",
};

export function QAMindAppIcon({ variant = "primary", size = 32, className }: QAMindAppIconProps) {
  return (
    <img
      src={appIconSrc[variant]}
      alt="QAMind"
      width={size}
      height={size}
      className={cn("rounded-[22%] object-contain", className)}
    />
  );
}
