import * as React from "react"
import { View, Text, type ViewProps } from "react-native"
import { cn } from "../../lib/utils"

interface TableProps extends ViewProps {}

const Table = React.forwardRef<React.ComponentRef<typeof View>, TableProps>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
  )
)

Table.displayName = "Table"

const TableHeader = React.forwardRef<React.ComponentRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
  )
)

TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<React.ComponentRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  )
)

TableBody.displayName = "TableBody"

const TableRow = React.forwardRef<React.ComponentRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "border-b transition-colors hover:bg-muted/50",
        className
      )}
      {...props}
    />
  )
)

TableRow.displayName = "TableRow"

const TableCell = React.forwardRef<React.ComponentRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("p-4 align-middle", className)}
      {...props}
    />
  )
)

TableCell.displayName = "TableCell"

export { Table, TableHeader, TableBody, TableRow, TableCell, type TableProps }
