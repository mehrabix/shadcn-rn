import * as React from "react"
import { View, Text, type ViewProps } from "react-native"
import { cn } from "../../lib/utils"

interface LabelProps extends ViewProps {
  children: React.ReactNode
}

const Label = React.forwardRef<React.ComponentRef<typeof View>, LabelProps>(
  ({ className, children, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("flex-row items-center", className)}
      {...props}
    >
      <Text className="text-sm font-medium leading-none">{children}</Text>
    </View>
  )
)

Label.displayName = "Label"

export { Label, type LabelProps }
