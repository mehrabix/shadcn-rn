import * as React from "react"
import { View, Text, type ViewProps } from "react-native"
import { cn } from "../../lib/utils"

interface AvatarProps extends ViewProps {
  src?: string
  alt?: string
  fallback?: string
}

const Avatar = React.forwardRef<React.ComponentRef<typeof View>, AvatarProps>(
  ({ className, src, alt, fallback, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {src ? (
        <View className="h-full w-full items-center justify-center bg-muted">
          <Text className="text-xs font-medium">{fallback || alt?.charAt(0) || "?"}</Text>
        </View>
      ) : (
        <View className="h-full w-full items-center justify-center bg-muted">
          <Text className="text-xs font-medium">{fallback || "?"}</Text>
        </View>
      )}
    </View>
  )
)

Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<React.ComponentRef<typeof View>, { className?: string }>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn("h-full w-full", className)} {...props} />
  )
)

AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<React.ComponentRef<typeof View>, { className?: string; children: React.ReactNode }>(
  ({ className, children, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <Text className="text-xs font-medium">{children}</Text>
    </View>
  )
)

AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback, type AvatarProps }
