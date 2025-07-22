import React, { useState, useMemo, useCallback } from "react";

export type TableSortDirection = "asc" | "desc" | null;
export type TableVariant = "default" | "bordered" | "striped" | "compact";
export type TableSize = "sm" | "md" | "lg";

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
  className?: string;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  variant?: TableVariant;
  size?: TableSize;
  loading?: boolean;
  empty?: React.ReactNode;
  caption?: string;
  rowKey?: keyof T | ((record: T) => string);
  selectable?: boolean;
  multiSelect?: boolean;
  selectedRows?: string[];
  onSelectChange?: (selectedKeys: string[], selectedRows: T[]) => void;
  onSort?: (column: string, direction: TableSortDirection) => void;
  onFilter?: (filters: Record<string, any>) => void;
  pagination?: TablePaginationProps;
  actions?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  sticky?: boolean;
  maxHeight?: string | number;
}

export interface TablePaginationProps {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  pageSizeOptions?: number[];
  onChange?: (page: number, pageSize: number) => void;
}

interface TableState {
  sortColumn: string | null;
  sortDirection: TableSortDirection;
  filters: Record<string, any>;
}

function Table<T = any>({
  data,
  columns,
  variant = "default",
  size = "md",
  loading = false,
  empty,
  caption,
  rowKey,
  selectable = false,
  multiSelect = false,
  selectedRows = [],
  onSelectChange,
  onSort,
  onFilter,
  pagination,
  actions,
  className = "",
  containerClassName = "",
  sticky = false,
  maxHeight,
}: TableProps<T>) {
  const [tableState, setTableState] = useState<TableState>({
    sortColumn: null,
    sortDirection: null,
    filters: {},
  });

  // Generate row key
  const getRowKey = useCallback(
    (record: T, index: number): string => {
      if (typeof rowKey === "function") {
        return rowKey(record);
      }
      if (typeof rowKey === "string") {
        return String(record[rowKey]);
      }
      return String(index);
    },
    [rowKey]
  );

  // Handle sorting
  const handleSort = useCallback(
    (column: TableColumn<T>) => {
      if (!column.sortable) return;

      const isCurrentColumn = tableState.sortColumn === column.key;
      let newDirection: TableSortDirection = "asc";

      if (isCurrentColumn) {
        newDirection =
          tableState.sortDirection === "asc"
            ? "desc"
            : tableState.sortDirection === "desc"
            ? null
            : "asc";
      }

      const newState = {
        ...tableState,
        sortColumn: newDirection ? column.key : null,
        sortDirection: newDirection,
      };

      setTableState(newState);
      onSort?.(column.key, newDirection);
    },
    [tableState, onSort]
  );

  // Handle selection
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!selectable || !onSelectChange) return;

      const allKeys = data.map((record, index) => getRowKey(record, index));
      onSelectChange(checked ? allKeys : [], checked ? data : []);
    },
    [data, selectable, onSelectChange, getRowKey]
  );

  const handleSelectRow = useCallback(
    (record: T, index: number, checked: boolean) => {
      if (!selectable || !onSelectChange) return;

      const key = getRowKey(record, index);

      if (multiSelect) {
        const newSelectedKeys = checked
          ? [...selectedRows, key]
          : selectedRows.filter((k) => k !== key);

        const newSelectedRows = data.filter((r, i) =>
          newSelectedKeys.includes(getRowKey(r, i))
        );

        onSelectChange(newSelectedKeys, newSelectedRows);
      } else {
        onSelectChange(checked ? [key] : [], checked ? [record] : []);
      }
    },
    [selectable, onSelectChange, multiSelect, selectedRows, data, getRowKey]
  );

  // Check if all rows are selected
  const isAllSelected = useMemo(() => {
    if (!selectable || data.length === 0) return false;
    return data.every((record, index) =>
      selectedRows.includes(getRowKey(record, index))
    );
  }, [selectable, data, selectedRows, getRowKey]);

  const isIndeterminate = useMemo(() => {
    if (!selectable || data.length === 0) return false;
    const selectedCount = data.filter((record, index) =>
      selectedRows.includes(getRowKey(record, index))
    ).length;
    return selectedCount > 0 && selectedCount < data.length;
  }, [selectable, data, selectedRows, getRowKey]);

  // Render cell content
  const renderCell = useCallback(
    (column: TableColumn<T>, record: T, index: number) => {
      if (column.render) {
        const value = column.dataIndex ? record[column.dataIndex] : record;
        return column.render(value, record, index);
      }

      if (column.dataIndex) {
        const value = record[column.dataIndex];
        return value !== null && value !== undefined ? String(value) : "";
      }

      return "";
    },
    []
  );

  // CSS classes
  const containerClasses = [
    "dm-table-container",
    sticky ? "dm-table-sticky" : "",
    containerClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const tableClasses = [
    "dm-table",
    `dm-table-${variant}`,
    `dm-table-${size}`,
    loading ? "dm-table-loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const containerStyle: React.CSSProperties = {
    maxHeight: maxHeight
      ? typeof maxHeight === "number"
        ? `${maxHeight}px`
        : maxHeight
      : undefined,
  };

  // Render empty state
  if (!loading && data.length === 0) {
    return (
      <div className={containerClasses}>
        {actions && <div className="dm-table-actions">{actions}</div>}
        <div className="dm-table-empty">
          {empty || (
            <div className="dm-table-empty-content">
              <span className="dm-table-empty-icon">📄</span>
              <p className="dm-table-empty-text">Nessun dato disponibile</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Table Actions */}
      {actions && <div className="dm-table-actions">{actions}</div>}

      {/* Table Container */}
      <div className="dm-table-wrapper" style={containerStyle}>
        <table className={tableClasses}>
          {/* Caption */}
          {caption && <caption className="dm-table-caption">{caption}</caption>}

          {/* Header */}
          <thead className="dm-table-header">
            <tr className="dm-table-header-row">
              {/* Selection Column */}
              {selectable && (
                <th className="dm-table-header-cell dm-table-selection-cell">
                  {multiSelect && (
                    <label className="dm-table-checkbox-label">
                      <input
                        type="checkbox"
                        className="dm-table-checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        aria-label="Seleziona tutti"
                      />
                      <span className="dm-table-checkbox-mark"></span>
                    </label>
                  )}
                </th>
              )}

              {/* Data Columns */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={[
                    "dm-table-header-cell",
                    column.sortable ? "dm-table-sortable" : "",
                    column.align ? `dm-table-align-${column.align}` : "",
                    column.className || "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column)}
                  role={column.sortable ? "button" : undefined}
                  tabIndex={column.sortable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (
                      column.sortable &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      e.preventDefault();
                      handleSort(column);
                    }
                  }}
                  aria-sort={
                    tableState.sortColumn === column.key
                      ? tableState.sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  <div className="dm-table-header-content">
                    <span className="dm-table-header-title">
                      {column.title}
                    </span>
                    {column.sortable && (
                      <span className="dm-table-sort-icon">
                        {tableState.sortColumn === column.key
                          ? tableState.sortDirection === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="dm-table-body">
            {loading ? (
              <tr className="dm-table-loading-row">
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="dm-table-loading-cell"
                >
                  <div className="dm-table-loading-content">
                    <div className="dm-table-spinner"></div>
                    <span>Caricamento...</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((record, index) => {
                const key = getRowKey(record, index);
                const isSelected = selectedRows.includes(key);

                return (
                  <tr
                    key={key}
                    className={[
                      "dm-table-row",
                      isSelected ? "dm-table-row-selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {/* Selection Cell */}
                    {selectable && (
                      <td className="dm-table-cell dm-table-selection-cell">
                        <label className="dm-table-checkbox-label">
                          <input
                            type="checkbox"
                            className="dm-table-checkbox"
                            checked={isSelected}
                            onChange={(e) =>
                              handleSelectRow(record, index, e.target.checked)
                            }
                            aria-label={`Seleziona riga ${index + 1}`}
                          />
                          <span className="dm-table-checkbox-mark"></span>
                        </label>
                      </td>
                    )}

                    {/* Data Cells */}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={[
                          "dm-table-cell",
                          column.align ? `dm-table-align-${column.align}` : "",
                          column.className || "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {renderCell(column, record, index)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && <TablePagination {...pagination} />}
    </div>
  );
}

// Pagination Component
const TablePagination: React.FC<TablePaginationProps> = ({
  current,
  pageSize,
  total,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal = true,
  pageSizeOptions = [10, 20, 50, 100],
  onChange,
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startRecord = (current - 1) * pageSize + 1;
  const endRecord = Math.min(current * pageSize, total);

  const handlePageChange = (page: number) => {
    if (page !== current && page >= 1 && page <= totalPages) {
      onChange?.(page, pageSize);
    }
  };

  const handleSizeChange = (newSize: number) => {
    const newPage = Math.ceil(((current - 1) * pageSize + 1) / newSize);
    onChange?.(newPage, newSize);
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Number of pages to show around current

    if (totalPages <= showPages + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (current > 3) {
        pages.push("...");
      }

      // Show pages around current
      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < totalPages - 2) {
        pages.push("...");
      }

      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (total === 0) return null;

  return (
    <div className="dm-table-pagination">
      {/* Total Info */}
      {showTotal && (
        <div className="dm-table-pagination-info">
          Mostrando {startRecord}-{endRecord} di {total} elementi
        </div>
      )}

      <div className="dm-table-pagination-controls">
        {/* Page Size Changer */}
        {showSizeChanger && (
          <div className="dm-table-pagination-size">
            <span>Mostra:</span>
            <select
              className="dm-table-pagination-select"
              value={pageSize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page Navigation */}
        <div className="dm-table-pagination-nav">
          {/* Previous Button */}
          <button
            className="dm-table-pagination-btn"
            disabled={current <= 1}
            onClick={() => handlePageChange(current - 1)}
            aria-label="Pagina precedente"
          >
            ←
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {typeof page === "number" ? (
                <button
                  className={[
                    "dm-table-pagination-btn",
                    "dm-table-pagination-page",
                    page === current ? "dm-table-pagination-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ) : (
                <span className="dm-table-pagination-ellipsis">{page}</span>
              )}
            </React.Fragment>
          ))}

          {/* Next Button */}
          <button
            className="dm-table-pagination-btn"
            disabled={current >= totalPages}
            onClick={() => handlePageChange(current + 1)}
            aria-label="Pagina successiva"
          >
            →
          </button>
        </div>

        {/* Quick Jumper */}
        {showQuickJumper && (
          <div className="dm-table-pagination-jumper">
            <span>Vai a:</span>
            <input
              type="number"
              className="dm-table-pagination-input"
              min={1}
              max={totalPages}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const page = parseInt(e.currentTarget.value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                    e.currentTarget.value = "";
                  }
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
