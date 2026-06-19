import * as React from "react"
import { Pressable, View, type PressableProps } from "react-native"
import { cn } from "../../lib/utils"

interface CheckboxProps extends PressableProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<React.ComponentRef<typeof Pressable>, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => {
    const handlePress = React.useCallback(() => {
      onCheckedChange?.(!checked)
    }, [checked, onCheckedChange])

    return (
      <Pressable
        ref={ref}
        className={cn(
          "h-4 w-4 rounded-sm border border-primary",
          checked && "bg-primary",
          className
        )}
        onPress={handlePress}
        {...props}
      >
        {checked && (
          <View className="h-full w-full items-center justify-center">
            <View className="h-2 w-2 rounded-sm bg-primary-foreground" />
          </View>
        )}
      </Pressable>
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox, type CheckboxProps }
