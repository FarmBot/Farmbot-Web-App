import { t } from "../i18next_wrapper";

export const TOAST_OPTIONS =
  (): Record<string, { title: string; color: string }> => ({
    success: { title: t("Success"), color: "green" },
    info: { title: t("FYI"), color: "blue" },
    warn: { title: t("Warning"), color: "orange" },
    error: { title: t("Error"), color: "red" },
    busy: { title: t("Busy"), color: "yellow" },
    debug: { title: t("Debug"), color: "gray" },
    fun: { title: t("Did you know?"), color: "dark-blue" },
  });
