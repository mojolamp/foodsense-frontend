import * as React from "react"
import { cn } from "@/lib/utils"

export type TableDensity = 'compact' | 'default' | 'spacious'

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
    density?: TableDensity
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
    ({ className, density = 'default', ...props }, ref) => (
        <div className="relative w-full overflow-auto">
            <table
                ref={ref}
                data-density={density}
                className={cn(
                    "w-full caption-bottom",
                    density === 'compact' && "text-xs",
                    density === 'default' && "text-sm",
                    density === 'spacious' && "text-sm",
                    className
                )}
                {...props}
            />
        </div>
    )
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody
        ref={ref}
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
    />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={cn(
            "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
            className
        )}
        {...props}
    />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr
        ref={ref}
        className={cn(
            "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
            className
        )}
        {...props}
    />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            "px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
            "[[data-density=compact]_&]:h-8 [[data-density=compact]_&]:py-1",
            "[[data-density=default]_&]:h-10 [[data-density=default]_&]:py-2",
            "[[data-density=spacious]_&]:h-12 [[data-density=spacious]_&]:py-3",
            className
        )}
        {...props}
    />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn(
            "align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
            "[[data-density=compact]_&]:px-2 [[data-density=compact]_&]:py-1",
            "[[data-density=default]_&]:p-2",
            "[[data-density=spacious]_&]:px-2 [[data-density=spacious]_&]:py-3",
            className
        )}
        {...props}
    />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption
        ref={ref}
        className={cn("mt-4 text-sm text-muted-foreground", className)}
        {...props}
    />
))
TableCaption.displayName = "TableCaption"

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
}
