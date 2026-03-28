import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageCard, EmptyState, SkeletonLoader } from '@/components/dashboard/PageStructure'
import { cn } from '@/lib/design-tokens'

export interface DataTableColumn<T> {
  key: keyof T | string
  header: string
  className?: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  className?: string
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your filters or create a new record.',
  emptyAction,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return <SkeletonLoader variant="table" rows={5} className={className} />
  }

  if (!rows.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    )
  }

  return (
    <PageCard variant="default" padding={false} className={cn('overflow-hidden', className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/40">
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={cn(
                  'px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-900 dark:text-white',
                  column.className
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={rowKey(row)}
              className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30"
            >
              {columns.map((column) => {
                const value = (row as any)[column.key as keyof T]
                return (
                  <TableCell
                    key={`${rowKey(row)}-${String(column.key)}`}
                    className={cn('px-6 py-4', column.className)}
                  >
                    {column.render ? column.render(row) : String(value ?? '')}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PageCard>
  )
}
