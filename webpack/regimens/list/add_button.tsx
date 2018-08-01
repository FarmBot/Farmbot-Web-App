import * as React from "react";
import { t } from "i18next";
import { AddRegimenProps } from "../interfaces";
import { push } from "../../history";
import { TaggedRegimen, SpecialStatus } from "farmbot";
import { init } from "../../api/crud";

function emptyRegimen(length: number): TaggedRegimen {
  return {
    kind: "Regimen",
    uuid: "NEVER",
    specialStatus: SpecialStatus.DIRTY,
    body: {
      name: (t("New regimen ") + (length++)),
      color: "gray",
      regimen_items: []
    }
  };
}

export function AddRegimen(props: AddRegimenProps) {
  props.className ? props.className : "";
  const classes = "fb-button green add " + props.className;
  let { length } = props;
  const { dispatch } = props;
  return <button
    className={classes}
    onClick={() => {
      dispatch(init(emptyRegimen(length)));
      push("/app/regimens/new_regimen_" + (length++));
    }}>
    {props.children || <i className="fa fa-plus" />}
  </button>;
}
