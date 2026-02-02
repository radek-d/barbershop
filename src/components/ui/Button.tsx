import { type ButtonHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-black text-white hover:bg-primary-800 shadow-sm hover:shadow-md":
              variant === "primary",
            "bg-white text-black border-2 border-black hover:bg-black hover:text-white":
              variant === "secondary",
            "border-2 text-black border-black bg-transparent hover:bg-black hover:text-white":
              variant === "outline",
            "hover:bg-gray-100 hover:text-black": variant === "ghost",
            "h-9 px-4 text-sm": size === "sm",
            "h-11 px-8 text-base": size === "md",
            "h-14 px-8 text-lg": size === "lg",
          },
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
