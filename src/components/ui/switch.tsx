import * as React from "react"
import { Pressable, type PressableProps } from "react-native"
import { cn } from "../../lib/utils"

interface SwitchProps extends PressableProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<React.ComponentRef<typeof Pressable>, SwitchProps>(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => {
    const handlePress = React.useCallback(() => {
      onCheckedChange?.(!checked)
    }, [checked, onCheckedChange])

    return (
      <Pressable
        ref={ref}
        className={cn(
          "h-6 w-11 rounded-full border-2 border-transparent",
          checked ? "bg-primary" : "bg-input",
          className
        )}
        onPress={handlePress}
        {...props}
      >
        <Pressable
          className={cn(
            "h-5 w-5 rounded-full bg-background shadow-md",
            checked ? "ml-5" : "ml-0"
          )}
        />
      </Pressable>
    )
  }
)

Switch.displayName = "Switch"

export { Switch, type SwitchProps }
