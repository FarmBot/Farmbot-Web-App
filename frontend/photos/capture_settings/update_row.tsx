import React from "react";
import { UpdateRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";

export const UpdateRow = (props: UpdateRowProps) =>
  <div className={"update-take-photo"}>
    <label>{t("Software")}</label>
    {props.version && <p className={"version-string"}>v{props.version}</p>}
  </div>;
