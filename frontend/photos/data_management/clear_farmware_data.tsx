import React from "react";
import { t } from "../../i18next_wrapper";
import { destroyAll } from "../../api/crud";
import { success, error } from "../../toast/toast";
import { ClearFarmwareDataProps } from "./interfaces";

export const ClearFarmwareData = (props: ClearFarmwareDataProps) =>
  <button
    className={"fb-button red"}
    title={t("delete all data")}
    onClick={() => {
      destroyAll("FarmwareEnv", false,
        t("Are you sure you want to delete all {{ num }} values?", {
          num: props.farmwareEnvs.length
        }))
        .then(() => success(t("Config data successfully deleted.")))
        .catch(() => error(t("Error deleting config data")));
    }}>
    {props.children || <i className={"fa fa-trash"} />}
  </button>;
