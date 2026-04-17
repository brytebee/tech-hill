// components/ui/data-table.tsx
'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

interface ServerPagination {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  serverPagination?: ServerPagination
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  serverPagination,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Only enable client-side pagination if no server pagination is provided
    ...(serverPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  const isServerPaginated = !!serverPagination

  return (
    <div className="space-y-4">
      {searchKey && !isServerPaginated && (
        <div className="relative max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="pl-10 h-11 bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-blue-500/20 shadow-sm"
          />
        </div>
      )}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl overflow-hidden shadow-sm dark:shadow-none">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-slate-900 dark:text-slate-100 font-semibold h-12">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 text-slate-700 dark:text-slate-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination row */}
      <div className="flex items-center justify-between px-2 pt-2">
        {isServerPaginated ? (
          <>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Page {serverPagination.currentPage} of {serverPagination.totalPages} &nbsp;·&nbsp; {serverPagination.totalCount} total
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => serverPagination.onPageChange(serverPagination.currentPage - 1)}
                disabled={serverPagination.currentPage <= 1}
                className="h-9 border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 font-medium"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              {/* Page number pills */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(serverPagination.totalPages, 5) }, (_, i) => {
                  let pageNum: number
                  const total = serverPagination.totalPages
                  const current = serverPagination.currentPage
                  if (total <= 5) {
                    pageNum = i + 1
                  } else if (current <= 3) {
                    pageNum = i + 1
                  } else if (current >= total - 2) {
                    pageNum = total - 4 + i
                  } else {
                    pageNum = current - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === current ? "default" : "outline"}
                      size="sm"
                      onClick={() => serverPagination.onPageChange(pageNum)}
                      className={`h-8 w-8 p-0 text-xs font-bold ${pageNum === current ? 'bg-blue-600 hover:bg-blue-500 text-white border-0' : 'border-slate-200 dark:border-slate-800'}`}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => serverPagination.onPageChange(serverPagination.currentPage + 1)}
                disabled={serverPagination.currentPage >= serverPagination.totalPages}
                className="h-9 border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 font-medium"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Showing {table.getFilteredRowModel().rows.length} of{' '}
              {table.getCoreRowModel().rows.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-9 border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 font-medium"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-9 border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 font-medium"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
