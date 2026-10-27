'use client';

import React, { useMemo, useState } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  filterType?: 'text' | 'select' | 'date';
  filterOptions?: { label: string; value: string }[];
  render?: (row: T, index: number) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T | string)[];
  statusFilterKey?: keyof T | string;
  statusOptions?: { label: string; value: string }[];
  initialPageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  bulkActions?: {
    label: string;
    icon?: string;
    action: (selectedRows: T[]) => void;
    className?: string;
  }[];
  exportFilename?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  extraHeaderActions?: React.ReactNode;
  showSerialNumber?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  searchKeys,
  statusFilterKey,
  statusOptions,
  initialPageSize = 10,
  selectable = false,
  onSelectionChange,
  bulkActions,
  exportFilename = 'gymflow-export',
  isLoading = false,
  emptyMessage = 'No matching records found.',
  extraHeaderActions,
  showSerialNumber = true,
}: DataTableProps<T>) {
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Sorting
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // 1. Filtered Data Computation
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Global Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        let matches = false;
        if (searchKeys && searchKeys.length > 0) {
          matches = searchKeys.some((k) => {
            const val = item[k as string];
            return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
          });
        } else {
          matches = Object.values(item).some(
            (val) => val !== undefined && val !== null && String(val).toLowerCase().includes(query)
          );
        }
        if (!matches) return false;
      }

      // Status Filter
      if (statusFilter && statusFilterKey) {
        const itemStatus = String(item[statusFilterKey as string] || '').toLowerCase();
        if (itemStatus !== statusFilter.toLowerCase()) return false;
      }

      // Column-Specific Filters
      for (const [key, filterVal] of Object.entries(columnFilters)) {
        if (!filterVal) continue;
        const itemVal = String(item[key] || '').toLowerCase();
        if (!itemVal.includes(filterVal.toLowerCase())) return false;
      }

      // Date Range Filter (looks for date/created/issueDate/startDate)
      if (dateRange.start || dateRange.end) {
        const itemDateStr = item.date || item.createdAt || item.issueDate || item.startDate;
        if (itemDateStr) {
          const itemDate = new Date(itemDateStr).toISOString().split('T')[0];
          if (dateRange.start && itemDate < dateRange.start) return false;
          if (dateRange.end && itemDate > dateRange.end) return false;
        }
      }

      return true;
    });
  }, [data, searchTerm, searchKeys, statusFilter, statusFilterKey, columnFilters, dateRange]);

  // 2. Sorted Data Computation (Sorting on actual underlying dates and numbers)
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (
        typeof aVal === 'string' &&
        typeof bVal === 'string' &&
        /^\d{4}-\d{2}-\d{2}/.test(aVal) &&
        /^\d{4}-\d{2}-\d{2}/.test(bVal)
      ) {
        comparison = new Date(aVal).getTime() - new Date(bVal).getTime();
      } else if (
        typeof aVal === 'string' &&
        typeof bVal === 'string' &&
        !isNaN(Number(aVal)) &&
        !isNaN(Number(bVal))
      ) {
        comparison = Number(aVal) - Number(bVal);
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // 3. Paginated Data Computation
  const totalCount = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (activePage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, activePage, pageSize]);

  // 4. Effective Columns (Automatic Sr. No. column as first business column)
  const effectiveColumns = useMemo(() => {
    const hasExistingSrNo = columns.some(
      (c) => c.header === 'Sr. No.' || c.header === 'Sr.No.' || c.key === '__srNo' || c.key === 'srNo'
    );
    if (!showSerialNumber || hasExistingSrNo) {
      return columns;
    }

    const srNoColumn: Column<T> = {
      key: '__srNo',
      header: 'Sr. No.',
      width: '75px',
      sortable: false,
      render: (_row: T, idx: number) => (
        <span style={{ fontWeight: 600, color: 'var(--text-subtle)', fontSize: '0.8125rem' }}>
          {(activePage - 1) * pageSize + idx + 1}
        </span>
      ),
    };

    return [srNoColumn, ...columns];
  }, [columns, showSerialNumber, activePage, pageSize]);

  // Handlers
  const handleSort = (key: string) => {
    if (key === '__srNo') return;
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setColumnFilters({});
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  // Row Selection
  const handleSelectAllVisible = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSelected = new Set(selectedIds);
    if (e.target.checked) {
      paginatedData.forEach((row, idx) => {
        const id = row.id || idx;
        newSelected.add(id);
      });
    } else {
      paginatedData.forEach((row, idx) => {
        const id = row.id || idx;
        newSelected.delete(id);
      });
    }
    setSelectedIds(newSelected);
    if (onSelectionChange) {
      const selected = data.filter((row, idx) => newSelected.has(row.id || idx));
      onSelectionChange(selected);
    }
  };

  const handleSelectRow = (rowId: string | number, _row: T) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedIds(newSelected);
    if (onSelectionChange) {
      const selected = data.filter((r, idx) => newSelected.has(r.id || idx));
      onSelectionChange(selected);
    }
  };

  const isAllVisibleSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row, idx) => selectedIds.has(row.id || idx));

  // CSV Export with Sr. No. as first column
  const handleExportCSV = () => {
    if (sortedData.length === 0) return;

    const exportCols = effectiveColumns.filter((c) => c.key !== 'actions');
    const headers = exportCols.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',');
    const rows = sortedData.map((row, idx) => {
      return exportCols
        .map((c) => {
          if (c.key === '__srNo') {
            return `"${idx + 1}"`;
          }
          const val = row[c.key];
          if (val === undefined || val === null) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFilename}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedRowsList = useMemo(() => {
    return data.filter((row, idx) => selectedIds.has(row.id || idx));
  }, [data, selectedIds]);

  return (
    <div className="card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
      {/* Table Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.85rem',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', flex: 1 }}>
          {/* Global Search Input */}
          <div style={{ position: 'relative', minWidth: '220px', maxWidth: '340px', flex: 1 }}>
            <i
              className="fa-solid fa-magnifying-glass"
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-subtle)',
                fontSize: '0.85rem',
              }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.875rem' }}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Status Filter */}
          {statusOptions && (
            <select
              className="form-control"
              style={{ width: 'auto', height: '38px', fontSize: '0.875rem' }}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* Date Range Filters */}
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <input
              type="date"
              className="form-control"
              style={{ height: '38px', width: '135px', fontSize: '0.8rem' }}
              value={dateRange.start}
              onChange={(e) => {
                setDateRange((prev) => ({ ...prev, start: e.target.value }));
                setCurrentPage(1);
              }}
              title="Filter from date"
            />
            <span style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>to</span>
            <input
              type="date"
              className="form-control"
              style={{ height: '38px', width: '135px', fontSize: '0.8rem' }}
              value={dateRange.end}
              onChange={(e) => {
                setDateRange((prev) => ({ ...prev, end: e.target.value }));
                setCurrentPage(1);
              }}
              title="Filter to date"
            />
          </div>

          {/* Reset Filters Button */}
          {(searchTerm || statusFilter || dateRange.start || dateRange.end || Object.keys(columnFilters).length > 0) && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ height: '38px', padding: '0 0.75rem', fontSize: '0.8rem' }}
              onClick={handleResetFilters}
            >
              <i className="fa-solid fa-rotate-left" /> Reset
            </button>
          )}
        </div>

        {/* Right Toolbar Actions */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          {/* Bulk Actions Menu if rows selected */}
          {selectable && selectedIds.size > 0 && bulkActions && bulkActions.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="badge badge-accent" style={{ height: '32px', display: 'flex', alignItems: 'center' }}>
                {selectedIds.size} selected
              </span>
              {bulkActions.map((ba, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={ba.className || 'btn btn-secondary'}
                  style={{ height: '38px', fontSize: '0.825rem' }}
                  onClick={() => ba.action(selectedRowsList)}
                >
                  {ba.icon && <i className={ba.icon} />} {ba.label}
                </button>
              ))}
            </div>
          )}

          {/* Export CSV */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: '38px', fontSize: '0.825rem' }}
            onClick={handleExportCSV}
            title="Export filtered records to CSV"
          >
            <i className="fa-solid fa-file-csv" /> Export CSV
          </button>

          {extraHeaderActions}
        </div>
      </div>

      {/* Table Container */}
      <div className="table-responsive" style={{ overflowX: 'auto', minHeight: '260px' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {selectable && (
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isAllVisibleSelected}
                    onChange={handleSelectAllVisible}
                    aria-label="Select all visible records"
                  />
                </th>
              )}
              {effectiveColumns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    width: col.width,
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span style={{ fontSize: '0.75rem', opacity: sortKey === col.key ? 1 : 0.35 }}>
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <i className="fa-solid fa-arrow-up" />
                          ) : (
                            <i className="fa-solid fa-arrow-down" />
                          )
                        ) : (
                          <i className="fa-solid fa-sort" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={effectiveColumns.length + (selectable ? 1 : 0)} style={{ textAlign: 'center', padding: '3rem' }}>
                  <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '1.5rem', color: 'var(--color-accent)' }} />
                  <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Loading records...</p>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={effectiveColumns.length + (selectable ? 1 : 0)}
                  style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}
                >
                  <i className="fa-solid fa-inbox" style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }} />
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowId = row.id || idx;
                const isSelected = selectedIds.has(rowId);
                return (
                  <tr key={rowId} className={isSelected ? 'row-selected' : ''}>
                    {selectable && (
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId, row)}
                          aria-label={`Select row ${rowId}`}
                        />
                      </td>
                    )}
                    {effectiveColumns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(row, idx) : (row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '—')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>
            Showing {totalCount === 0 ? 0 : (activePage - 1) * pageSize + 1} to{' '}
            {Math.min(activePage * pageSize, totalCount)} of {totalCount} records
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Per page:</span>
            <select
              className="form-control"
              style={{ width: 'auto', height: '32px', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Page Nav Controls */}
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: '32px', padding: '0 0.55rem', fontSize: '0.75rem' }}
            disabled={activePage <= 1}
            onClick={() => setCurrentPage(1)}
            title="First page"
          >
            <i className="fa-solid fa-angles-left" />
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: '32px', padding: '0 0.65rem', fontSize: '0.75rem' }}
            disabled={activePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            title="Previous page"
          >
            <i className="fa-solid fa-chevron-left" /> Prev
          </button>

          <span style={{ padding: '0 0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Page {activePage} of {totalPages}
          </span>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: '32px', padding: '0 0.65rem', fontSize: '0.75rem' }}
            disabled={activePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            title="Next page"
          >
            Next <i className="fa-solid fa-chevron-right" />
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: '32px', padding: '0 0.55rem', fontSize: '0.75rem' }}
            disabled={activePage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            title="Last page"
          >
            <i className="fa-solid fa-angles-right" />
          </button>
        </div>
      </div>
    </div>
  );
}
