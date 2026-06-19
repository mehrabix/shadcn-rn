import * as React from "react"
import { View, Text, type ViewProps, type TextProps } from "react-native"
import { cn } from "../../lib/utils"

interface BadgeProps extends ViewProps {
  variant?: "default" | "secondary" | "destructive" | "outline"
  children: React.ReactNode
}

const Badge = React.forwardRef<React.ComponentRef<typeof View>, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "flex-row items-center rounded-full border px-2.5 py-0.5",
        variant === "default" && "border-transparent bg-primary",
        variant === "secondary" && "border-transparent bg-secondary",
        variant === "destructive" && "border-transparent bg-destructive",
        variant === "outline" && "border-border",
        className
      )}
      {...props}
    >
      <Text
        className={cn(
          "text-xs font-semibold",
          variant === "default" && "text-primary-foreground",
          variant === "secondary" && "text-secondary-foreground",
          variant === "destructive" && "text-destructive-foreground",
          variant === "outline" && "text-foreground"
        )}
      >
        {children}
      </Text>
    </View>
  )
)

Badge.displayName = "Badge"

export { Badge, type BadgeProps }
