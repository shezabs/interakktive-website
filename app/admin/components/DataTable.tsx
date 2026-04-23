'use client';

import { useState, useMemo, ReactNode } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  // Value used for sorting (if different from display). Must be string | number | boolean | null.
  sortValue?: (row: T) => string | number | boolean | null;
  // Render function for the cell content.
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  searchPlaceholder?: string;
  // Fields to search across. If omitted, no search input is shown.
  searchFields?: (row: T) => string;
  // Extra filter UI rendered in the toolbar.
  toolbarExtra?: ReactNode;
  pageSize?: number;
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyMessage = 'No records found.',
  searchPlaceholder = 'Search...',
  searchFields,
  toolbarExtra,
  pageSize = 50,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);

  // Filter + sort
  const processed = useMemo(() => {
    let result = rows;

    // Search filter
    if (searchFields && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((r) => {
        const haystack = searchFields(r).toLowerCase();
        return haystack.includes(term);
      });
    }

    // Sort
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col) {
        const getValue = col.sortValue || ((r: T) => (r as any)[sortKey]);
        result = [...result].sort((a, b) => {
          const va = getValue(a);
          const vb = getValue(b);
          if (va === null || va === undefined) return 1;
          if (vb === null || vb === undefined) return -1;
          if (va < vb) return sortDir === 'asc' ? -1 : 1;
          if (va > vb) return sortDir === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    return result;
  }, [rows, searchTerm, sortKey, sortDir, columns, searchFields]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const pageRows = processed.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(0);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      {(searchFields || toolbarExtra) && (
        <div className="flex flex-wrap items-center gap-3">
          {searchFields && (
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          )}
          {toolbarExtra}
          <div className="ml-auto text-xs text-gray-500">
            {processed.length} {processed.length === 1 ? 'record' : 'records'}
            {searchTerm && ` (filtered from ${rows.length})`}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400"
                  >
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        {col.header}
                        {sortKey === col.key && (
                          sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500 text-sm">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`border-b border-white/5 last:border-b-0 ${
                      onRowClick ? 'cursor-pointer hover:bg-white/[0.04] transition-colors' : ''
                    }`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-gray-300">
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-white/[0.01]">
            <div className="text-xs text-gray-500">
              Page {page + 1} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 text-xs rounded-md bg-white/5 border border-white/10 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 text-xs rounded-md bg-white/5 border border-white/10 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
