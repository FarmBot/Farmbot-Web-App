import React from "react";
import { t } from "../../i18next_wrapper";
import { destroyAll } from "../../api/crud";
import { success, error } from "../../toast/toast";

export const ClearFarmwareData = ({ children }: { children?: React.ReactChild }) =>
  <button
    className={"fb-button red"}
    title={t("delete all data")}
    onClick={() => destroyAll("FarmwareEnv")
      .then(() => success(t("Config data successfully deleted.")))
      .catch(() => error(t("Error deleting config data")))}>
    {children || <i className={"fa fa-trash"} />}
  </button>;
