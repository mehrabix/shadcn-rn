import * as React from "react"
import { View, Text, type ViewProps } from "react-native"
import { cn } from "../../lib/utils"

interface AlertProps extends ViewProps {
  variant?: "default" | "destructive"
  children: React.ReactNode
}

const Alert = React.forwardRef<React.ComponentRef<typeof View>, AlertProps>(
  ({ className, variant = "default", children, ...props }, ref) => (
    <View
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4",
        variant === "default" && "border-border bg-background",
        variant === "destructive" && "border-destructive/50 bg-destructive/10",
        className
      )}
      {...props}
    >
      {children}
    </View>
  )
)

Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<React.ComponentRef<typeof Text>, { className?: string; children: React.ReactNode }>(
  ({ className, children, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </Text>
  )
)

AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<React.ComponentRef<typeof Text>, { className?: string; children: React.ReactNode }>(
  ({ className, children, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn("text-sm", className)}
      {...props}
    >
      {children}
    </Text>
  )
)

AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription, type AlertProps }
