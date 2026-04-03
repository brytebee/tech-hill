// components/ui/collapsible.tsx
"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger> & {
    showIcon?: boolean;
    iconPosition?: "left" | "right";
  }
>(
  (
    { className, children, showIcon = true, iconPosition = "left", ...props },
    ref
  ) => (
    <CollapsiblePrimitive.Trigger
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between space-x-2 text-left [&[data-state=open]>svg]:rotate-90 transition-all",
        className
      )}
      {...props}
    >
      {showIcon && iconPosition === "left" && (
        <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
      )}
      <div className="flex-1">{children}</div>
      {showIcon && iconPosition === "right" && (
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
      )}
    </CollapsiblePrimitive.Trigger>
  )
);
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName;

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
      className
    )}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </CollapsiblePrimitive.Content>
));
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;

// Enhanced collapsible with built-in styling
const CollapsibleCard = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> & {
    title?: string;
    subtitle?: string;
    variant?: "default" | "outline" | "ghost";
    size?: "sm" | "default" | "lg";
    triggerClassName?: string;
    contentClassName?: string;
  }
>(
  (
    {
      className,
      title,
      subtitle,
      variant = "default",
      size = "default",
      triggerClassName,
      contentClassName,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "p-3",
      default: "p-4",
      lg: "p-6",
    };

    const variantClasses = {
      default: "border bg-card text-card-foreground shadow-sm",
      outline: "border-2 border-border bg-transparent",
      ghost: "border-0 bg-transparent shadow-none",
    };

    return (
      <CollapsiblePrimitive.Root
        ref={ref}
        className={cn(
          "rounded-lg transition-all duration-200",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <CollapsiblePrimitive.Trigger
          className={cn(
            "flex w-full items-center justify-between text-left hover:bg-accent/50 rounded-lg transition-colors",
            sizeClasses[size],
            "[&[data-state=open]>svg]:rotate-180",
            triggerClassName
          )}
        >
          <div className="space-y-1">
            {title && <div className="font-medium leading-none">{title}</div>}
            {subtitle && (
              <div className="text-sm text-muted-foreground">{subtitle}</div>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        </CollapsiblePrimitive.Trigger>
        <CollapsiblePrimitive.Content
          className={cn(
            "overflow-hidden text-sm data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
            contentClassName
          )}
        >
          <div className={cn("border-t pt-4", sizeClasses[size])}>
            {children}
          </div>
        </CollapsiblePrimitive.Content>
      </CollapsiblePrimitive.Root>
    );
  }
);
CollapsibleCard.displayName = "CollapsibleCard";

// Simple accordion-style collapsible
const CollapsibleAccordion = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> & {
    items: Array<{
      id: string;
      title: string;
      content: React.ReactNode;
      disabled?: boolean;
    }>;
    type?: "single" | "multiple";
    className?: string;
  }
>(({ items, type = "single", className, ...props }, ref) => {
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const handleToggle = (itemId: string) => {
    if (type === "single") {
      setOpenItems((prev) => (prev.includes(itemId) ? [] : [itemId]));
    } else {
      setOpenItems((prev) =>
        prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId]
      );
    }
  };

  return (
    <div className={cn("space-y-2", className)} ref={ref} {...props}>
      {items.map((item) => (
        <Collapsible
          key={item.id}
          open={openItems.includes(item.id)}
          onOpenChange={() => handleToggle(item.id)}
          disabled={item.disabled}
        >
          <CollapsibleTrigger
            className={cn(
              "flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left hover:bg-accent transition-colors",
              item.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="font-medium">{item.title}</span>
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="border-x border-b border-t-0 rounded-b-lg bg-card">
            <div className="p-4 pt-0">{item.content}</div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
});
CollapsibleAccordion.displayName = "CollapsibleAccordion";

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleCard,
  CollapsibleAccordion,
};
