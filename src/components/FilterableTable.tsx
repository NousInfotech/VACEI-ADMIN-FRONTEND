import React from 'react';
import ActionButton from './ActionButton'; // adjust path
import { Eye, Edit3, UserPlus, Trash2, XCircle, CheckCircle } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface Action {
  title: string;
  icon: React.ReactNode;
  color: string;
  href?: string;
  onClick?: () => void;
}

interface FilterableTableProps {
  loading: boolean;
  initialLoading?: boolean;
  filters: React.ReactNode; // custom filter UI JSX
  columns: Column[];
  data: any[];
  actionsForRow: (row: any) => Action[];
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  pagination: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  noDataText?: string;
  SkeletonRow?: React.ComponentType;
}

export default function FilterableTable({
  loading,
  initialLoading,
  filters,
  columns,
  data,
  actionsForRow,
  sortField,
  sortOrder,
  onSort,
  pagination,
  noDataText = 'No data found.',
  SkeletonRow,
}: FilterableTableProps) {
  return (
    <div className="bg-white shadow p-6 mt-5">
      {initialLoading ? (
        SkeletonRow ? <SkeletonRow /> : <div>Loading...</div>
      ) : (
        <>
          {filters}
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`p-3 text-left border-r border-gray-300 select-none ${
                      col.sortable ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => col.sortable && onSort?.(col.key)}
                  >
                    {col.label}{' '}
                    {sortField === col.key && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                ))}
                <th className="p-3 text-left border-r border-gray-300">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                SkeletonRow
                  ? Array(5)
                      .fill(null)
                      .map((_, i) => <SkeletonRow key={i} />)
                  : (
                    <tr>
                      <td colSpan={columns.length + 1} className="p-4 text-center">
                        Loading...
                      </td>
                    </tr>
                  )
              ) : data.length ? (
                data.map((row) => (
                  <tr key={row.id} className="border-b border-gray-300">
                    {columns.map((col) => (
                      <td key={col.key} className="p-3 border-r border-gray-300">
                        {col.render ? col.render(row[col.key], row) : row[col.key] ?? 'N/A'}
                      </td>
                    ))}
                    <td className="p-3 border-gray-300 flex gap-2 flex-wrap">
                      {actionsForRow(row).map(({ title, icon, color, href, onClick }, i) =>
                        href ? (
                          <ActionButton
                            key={i}
                            href={href}
                            icon={icon}
                            title={title}
                            color={color}
                          />
                        ) : (
                          <ActionButton
                            key={i}
                            icon={icon}
                            title={title}
                            color={color}
                            onClick={onClick}
                          />
                        )
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="p-4 text-center text-gray-500">
                    {noDataText}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-end space-x-4 py-4">
            <button
              disabled={pagination.page === 1}
              onClick={() => pagination.onPageChange(Math.max(pagination.page - 1, 1))}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40"
            >
              Prev
            </button>
            <span className="inline-block px-3 py-1 border border-gray-300 rounded">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() =>
                pagination.onPageChange(Math.min(pagination.page + 1, pagination.totalPages))
              }
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
