import React from "react";
import { Row, Help } from "../../../ui";
import { t } from "../../../i18next_wrapper";
import { ToolTips } from "../../../constants";
import { Checkbox } from "@blueprintjs/core";
import { Move, SafeZ } from "farmbot";
import { SafeZCheckboxProps } from "./interfaces";

export const SafeZCheckbox = (props: SafeZCheckboxProps) =>
  <Row className="grid-4-col">
    <div className="row half-gap grid-exp-2">
      <label className={"safe-z"}>{t("Safe Z")}</label>
      <Help text={ToolTips.SAFE_Z} customClass={"help-icon"} />
    </div>
    <Checkbox title={t("toggle safe z")}
      checked={props.checked}
      onChange={props.onChange} />
  </Row>;

export const getSafeZState = (step: Move) => {
  const safeZ = step.body?.find(x => x.kind == "safe_z");
  return safeZ?.kind == "safe_z";
};

export const SAFE_Z: SafeZ = { kind: "safe_z", args: {} };
