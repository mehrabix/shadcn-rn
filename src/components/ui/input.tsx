import * as React from "react"
import { TextInput, type TextInputProps } from "react-native"
import { cn } from "../../lib/utils"

interface InputProps extends TextInputProps {}

const Input = React.forwardRef<React.ComponentRef<typeof TextInput>, InputProps>(
  ({ className, ...props }, ref) => (
    <TextInput
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring",
        "disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
)

Input.displayName = "Input"

export { Input, type InputProps }
