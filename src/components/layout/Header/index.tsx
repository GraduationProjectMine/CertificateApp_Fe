import React from "react";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles._1}>
      <div className={styles._2}>
        <Link href="/" className={styles._3}>CertiChain</Link>
        <nav className={styles._4}>
          <Link href="/public/verify" className={styles._5}>Xác minh</Link>
          <Link href="/auth/login" className={styles._5}>Đăng nhập</Link>
        </nav>
      </div>
    </header>
  );
}
