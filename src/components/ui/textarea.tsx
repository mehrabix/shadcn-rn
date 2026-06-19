import * as React from "react"
import { TextInput, type TextInputProps, View, Text } from "react-native"
import { cn } from "../../lib/utils"

interface TextareaProps extends TextInputProps {}

const Textarea = React.forwardRef<React.ComponentRef<typeof TextInput>, TextareaProps>(
  ({ className, ...props }, ref) => (
    <TextInput
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring",
        "disabled:opacity-50",
        className
      )}
      multiline
      textAlignVertical="top"
      {...props}
    />
  )
)

Textarea.displayName = "Textarea"

export { Textarea, type TextareaProps }
