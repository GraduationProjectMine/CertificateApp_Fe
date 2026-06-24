"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const REVEAL_SELECTOR = [
  "[data-reveal]",
  ".motion-reveal",
].join(",");

export function AppMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("motion-ready");

    let candidates: HTMLElement[] = [];
    let frame = 0;
    let refreshFrame = 0;

    const collectCandidates = () => {
      candidates = Array.from(
        document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
      ).filter((element) => !element.closest("[data-motion-disabled]"));

      const candidateSet = new Set(candidates);
      document.querySelectorAll<HTMLElement>(".reveal-item").forEach((element) => {
        if (candidateSet.has(element)) return;
        element.classList.remove("reveal-item", "is-revealed");
        element.style.removeProperty("--reveal-delay");
      });

      candidates.forEach((element, index) => {
        element.classList.add("reveal-item");
        element.style.setProperty("--reveal-delay", `${Math.min(index % 8, 7) * 55}ms`);
      });
    };

    const updateRevealState = () => {
      frame = 0;
      const viewportHeight = window.innerHeight;
      const revealLine = viewportHeight * 0.88;
      const topRevealLine = viewportHeight * 0.04;
      const resetBuffer = Math.min(160, viewportHeight * 0.18);

      candidates.forEach((element) => {
        if (!document.documentElement.contains(element)) return;

        const rect = element.getBoundingClientRect();
        const shouldReveal = rect.top < revealLine && rect.bottom > topRevealLine;
        if (shouldReveal) {
          element.classList.add("is-revealed");
          return;
        }

        const isFarOutsideViewport = rect.bottom < -resetBuffer || rect.top > viewportHeight + resetBuffer;
        if (isFarOutsideViewport) {
          element.classList.remove("is-revealed");
        }
      });
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateRevealState);
    };

    const refreshCandidates = () => {
      refreshFrame = 0;
      collectCandidates();
      scheduleUpdate();
    };

    const scheduleRefresh = () => {
      if (refreshFrame) return;
      refreshFrame = window.requestAnimationFrame(refreshCandidates);
    };

    collectCandidates();
    scheduleUpdate();

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleRefresh);

    const mutationObserver = new MutationObserver(scheduleRefresh);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleRefresh);
      mutationObserver.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      if (refreshFrame) window.cancelAnimationFrame(refreshFrame);
    };
  }, [pathname]);

  return <>{children}</>;
}
