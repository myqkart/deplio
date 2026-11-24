import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-[6px] border text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color] duration-[80ms] ease-[cubic-bezier(0.33,1,0.68,1)] outline-none select-none disabled:cursor-not-allowed disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-[var(--border-subtle)] bg-[var(--btn-bg)] text-foreground hover:border-[#8b949e] hover:bg-[var(--btn-hover-bg)] active:bg-[var(--btn-active-bg)] disabled:text-subtle",
        primary:
          "border-[var(--border-subtle)] bg-primary text-primary-foreground hover:bg-[var(--btn-primary-hover)] active:bg-[var(--btn-primary-active)] disabled:bg-[rgba(35,134,54,0.6)] disabled:text-[rgba(255,255,255,0.5)]",
        secondary:
          "border-[var(--border-subtle)] bg-[var(--btn-bg)] text-foreground hover:border-[#8b949e] hover:bg-[var(--btn-hover-bg)] active:bg-[var(--btn-active-bg)] disabled:text-subtle",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-control-hover hover:text-foreground",
        destructive:
          "border-[var(--border-subtle)] bg-[var(--btn-bg)] text-danger-foreground hover:border-danger-border hover:bg-danger-emphasis hover:text-white",
        outline:
          "border-[var(--border-subtle)] bg-[var(--btn-bg)] text-foreground hover:border-[#8b949e] hover:bg-[var(--btn-hover-bg)]",
        link: "border-transparent bg-transparent text-link hover:underline",
      },
      size: {
        default: "h-11 min-h-11 px-4 text-sm md:h-8 md:min-h-8",
        sm: "h-9 min-h-9 px-3 text-sm md:h-7 md:min-h-7",
        lg: "h-11 min-h-11 px-4 text-sm md:h-10 md:min-h-10",
        icon: "size-11 min-h-11 min-w-11 p-0 md:size-8 md:min-h-8 md:min-w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
