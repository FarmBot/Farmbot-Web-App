import React from "react";
import { UpdateRowProps } from "./interfaces";
import { requestFarmwareUpdate } from "../../farmware/farmware_info";
import { t } from "../../i18next_wrapper";

export const UpdateRow = (props: UpdateRowProps) =>
  <div className={"update-take-photo"}>
    <label>{t("Software")}</label>
    {props.version && <p className={"version-string"}>v{props.version}</p>}
    <button
      className={`fb-button gray ${props.botOnline ? "" : "pseudo-disabled"}`}
      onClick={requestFarmwareUpdate("take-photo", props.botOnline)}>
      {t("Update")}
    </button>
  </div>;
