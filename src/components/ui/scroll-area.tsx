import * as React from "react"
import { ScrollView, type ScrollViewProps } from "react-native"
import { cn } from "../../lib/utils"

interface ScrollAreaProps extends ScrollViewProps {}

const ScrollArea = React.forwardRef<React.ComponentRef<typeof ScrollView>, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <ScrollView
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  )
)

ScrollArea.displayName = "ScrollArea"

export { ScrollArea, type ScrollAreaProps }
