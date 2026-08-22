"use client";

import React from "react";
import { useI18n } from "@/features/i18n/I18nContext";
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageToggle from "@/components/common/LanguageToggle";
import Tooltip from "@/components/common/Tooltip";
import styles from "./app-controls.module.css";

type AppControlsProps = {
  className?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
};

export default function AppControls({ className = "", tooltipPosition = "bottom" }: AppControlsProps) {
  const { t } = useI18n();

  return (
    <div className={`${styles.group} ${className}`.trim()}>
      <Tooltip content={t("common.themeTooltip")} position={tooltipPosition}>
        <ThemeToggle />
      </Tooltip>
      <Tooltip content={t("common.languageTooltip")} position={tooltipPosition}>
        <LanguageToggle />
      </Tooltip>
    </div>
  );
}
