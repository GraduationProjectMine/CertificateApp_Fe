import React from "react";
import styles from "./table.module.css";

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
    <div className={styles._1}>
      <table className={styles._2}>
        <thead>
          <tr className={styles._3}>
            {columns.map((col) => (
              <th key={col.key} className={styles._4}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className={styles._5}>
          {data.map((item) => (
            <tr key={keyExtractor(item)} className={styles._6}>
              {columns.map((col) => (
                <td key={col.key} className={styles._7}>
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
