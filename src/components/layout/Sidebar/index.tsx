import React from "react";
import Link from "next/link";
import styles from "./Sidebar.module.css";

export default function Sidebar({ items, pathname }: { items: { label: string; href: string; icon: string }[]; pathname: string }) {
  return (
    <aside className={styles._1}>
      <div className={styles._2}>
        <Link href="/" className={styles._3}>CertiChain</Link>
      </div>
      <nav className={styles._4}>
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`${styles._0} ${isActive ? "bg-primary text-white" : "text-slate-400 dark:text-slate-500 hover:text-white hover:bg-slate-800/40"}`}
            >
              <svg className={styles._5} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
