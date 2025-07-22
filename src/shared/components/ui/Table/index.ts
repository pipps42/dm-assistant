// Import CSS styles
import "./Table.css";

export { default as Table } from "./Table";
export type {
  TableProps,
  TableColumn,
  TableSortDirection,
  TableVariant,
  TableSize,
  TablePaginationProps,
} from "./Table";

// Re-export for convenience
export type { TableProps as DataTableProps } from "./Table";
