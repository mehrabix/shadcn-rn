import * as React from "react"
import { View, type ViewProps } from "react-native"
import { cn } from "../../lib/utils"

interface SeparatorProps extends ViewProps {
  orientation?: "horizontal" | "vertical"
}

const Separator = React.forwardRef<React.ComponentRef<typeof View>, SeparatorProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  )
)

Separator.displayName = "Separator"

export { Separator, type SeparatorProps }
