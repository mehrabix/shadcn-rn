import * as React from "react"
import { View, type ViewProps } from "react-native"
import { cn } from "../../lib/utils"

interface SkeletonProps extends ViewProps {}

const Skeleton = React.forwardRef<React.ComponentRef<typeof View>, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("h-4 w-full animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
)

Skeleton.displayName = "Skeleton"

export { Skeleton, type SkeletonProps }
