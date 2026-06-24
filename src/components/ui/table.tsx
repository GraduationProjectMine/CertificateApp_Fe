import React from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
}

export default function Table<T>({ columns, data, keyExtractor }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400">
            {columns.map((col) => (
              <th key={col.key} className="p-4">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="p-4 text-gray-700 dark:text-gray-300">
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
