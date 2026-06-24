"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const REVEAL_SELECTOR = [
  "[data-reveal]",
  ".motion-reveal",
  "section",
  "article",
  "main section",
  "main article",
  "form > *",
].join(",");

export function AppMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("motion-ready");

    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
    ).filter((element) => !element.closest("[data-motion-disabled]"));

    candidates.forEach((element, index) => {
      element.classList.add("reveal-item");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 8, 7) * 55}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
          } else if (entry.boundingClientRect.top > 0) {
            entry.target.classList.remove("is-revealed");
          }
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12,
      },
    );

    candidates.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [pathname]);

  return <>{children}</>;
}
