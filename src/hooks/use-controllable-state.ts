import { useState, useCallback } from "react"

export function useControllableState<T>({
  defaultValue,
  value,
  onChange,
}: {
  defaultValue?: T
  value?: T
  onChange?: (value: T) => void
}): [T, (value: T) => void] {
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue)

  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const setValue = useCallback(
    (newValue: T) => {
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
    },
    [isControlled, onChange]
  )

  return [currentValue as T, setValue]
}
