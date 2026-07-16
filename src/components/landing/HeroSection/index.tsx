"use client";
import styles from "./HeroSection.module.css";
import React from "react";
import Link from "next/link";
import { useI18n } from "@/features/i18n/I18nContext";

export default function HeroSection() {
  const { t } = useI18n();

  return (
    <section className={styles._1}>
      <div className={styles._2} />
      <div className={styles._3} />

      <div className={styles._4}>
        <div className={styles._5}>
          <div className={styles._6} data-reveal>
            <div className={styles._7}>
              <span className={styles._8} />
              {t("hero.badge")}
            </div>

            <h1 className={styles._9}>
              {t("hero.title1")}
              <span className={`gradient-text-premium ${styles._10}`}>
                {t("hero.title2")}
              </span>
            </h1>

            <p className={styles._11}>
              {t("hero.desc")}
            </p>

            <div className={styles._12}>
              <Link
                href="/public/verify"
                className={styles._13}
              >
                {t("hero.cta_verify")}
                <svg className={styles._14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/auth/login"
                className={styles._15}
              >
                {t("hero.cta_login")}
              </Link>
            </div>

            <p className={styles._16}>
              {t("hero.no_card")}
            </p>

            <div className={styles._17}>
              <div>
                <span className={styles._18}>100%</span>
                <span className={styles._19}>{t("hero.stat1_label")}</span>
              </div>
              <div>
                <span className={styles._18}>&lt; 3s</span>
                <span className={styles._19}>{t("hero.stat2_label")}</span>
              </div>
              <div>
                <span className={styles._18}>0₫</span>
                <span className={styles._19}>{t("hero.stat3_label")}</span>
              </div>
            </div>
          </div>

          <div className={styles._20} data-reveal>
            <div className={styles._21}>
              <div className={styles._22} />
              <div className={styles._23}>
                <div className={styles._24} />

                <div className={styles._25}>
                  <div className={styles._26}>
                    <div className={styles._27}>
                      <svg className={styles._14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <div>
                      <p className={styles._28}>TRƯỜNG ĐẠI HỌC CMC</p>
                      <p className={styles._29}>CMC University</p>
                    </div>
                  </div>
                  <span className={styles._30}>
                    On-chain
                  </span>
                </div>

                <div className={styles._31}>
                  <p className={styles._32}>Bằng Cử Nhân</p>
                  <p className={styles._33}>CÔNG NGHỆ THÔNG TIN</p>
                </div>

                <div className={styles._34}>
                  <div>
                    <p className={styles._35}>Sinh viên</p>
                    <p className={styles._36}>Nguyễn Hoàng Nam</p>
                  </div>
                  <div>
                    <p className={styles._35}>Xếp loại</p>
                    <p className={styles._36}>Xuất Sắc (3.82)</p>
                  </div>
                </div>

                <div className={styles._37}>
                  <div>
                    <p className={styles._38}>Blockchain Hash</p>
                    <p className={styles._39}>0x71C7...8976F</p>
                  </div>
                  <div className={styles._40}>
                    <div className={styles._41}>
                      <svg className={styles._42} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                    </div>
                    <div className={styles._41}>
                      <svg className={styles._42} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" d="M7 17l9.2-9.2M17 17V7H7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <p className={styles._39} style={{ marginTop: "0.5rem", opacity: 0.6 }}>
                  Verified by NguyenTT
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
