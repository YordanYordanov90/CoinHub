import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface DataTableColumn<T> {
  header: React.ReactNode;
  cell: (row: T, index: number) => React.ReactNode;
  headClassName?: string;
  cellClassName?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => React.Key;
  tableClassName?: string;
  headerClassName?: string;
  headerRowClassName?: string;
  headerCellClassName?: string;
  bodyRowClassName?: string;
  bodyCellClassName?: string;
}

const DataTable =<T,>({
  columns,
  data,
  rowKey,
  tableClassName,
  headerRowClassName,
  bodyRowClassName,
  headerClassName,
  headerCellClassName,
  bodyCellClassName,
}: DataTableProps<T>) => {
  return (
   <Table className={cn('custom-scrollbar', tableClassName)}>
      <TableHeader className={headerClassName}>
        <TableRow className={cn('hover:bg-transparent!', headerRowClassName)}>
          {columns.map((column, i) => (
            <TableHead
              key={i}
              className={cn(
                'bg-muted/50 text-muted-foreground py-4 first:pl-5 last:pr-5 font-medium',
                headerCellClassName,
                column.headClassName,
              )}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow
            key={rowKey(row, rowIndex)}
            className={cn(
              'overflow-hidden rounded-lg border-b border-border/50 hover:bg-muted/30 relative',
              bodyRowClassName,
            )}
          >
            {columns.map((column, columnIndex) => (
              <TableCell
                key={columnIndex}
                className={cn(
                  'py-4 first:pl-5 last:pr-5',
                  bodyCellClassName,
                  column.cellClassName,
                )}
              >
                {column.cell(row, rowIndex)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default DataTable