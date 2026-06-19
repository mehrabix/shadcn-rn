import * as React from "react"
import { Pressable, Text, type PressableProps, type TextProps } from "react-native"
import { cn } from "../../lib/utils"

interface ButtonProps extends PressableProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  children: React.ReactNode
}

const Button = React.forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    return (
      <Pressable
        className={cn(
          "flex-row items-center justify-center rounded-md",
          variant === "default" && "bg-primary",
          variant === "destructive" && "bg-destructive",
          variant === "outline" && "border border-input bg-background",
          variant === "secondary" && "bg-secondary",
          variant === "ghost" && "bg-transparent",
          variant === "link" && "bg-transparent",
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 px-3",
          size === "lg" && "h-11 px-8",
          size === "icon" && "h-10 w-10",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Pressable>
    )
  }
)

Button.displayName = "Button"

export { Button, type ButtonProps }
