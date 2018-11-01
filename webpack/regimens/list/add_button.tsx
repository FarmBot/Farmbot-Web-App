import * as React from "react";
import { t } from "i18next";
import { AddRegimenProps } from "../interfaces";
import { push } from "../../history";
import { TaggedRegimen } from "farmbot";
import { init } from "../../api/crud";

const emptyRegimenBody = (length: number): TaggedRegimen["body"] => ({
  name: (t("New regimen ") + (length++)),
  color: "gray",
  regimen_items: []
});

export function AddRegimen(props: AddRegimenProps) {
  props.className ? props.className : "";
  const classes = "fb-button green add " + props.className;
  let { length } = props;
  const { dispatch } = props;
  return <button
    className={classes}
    onClick={() => {
      dispatch(init("Regimen", emptyRegimenBody(length)));
      push("/app/regimens/new_regimen_" + (length++));
    }}>
    {props.children || <i className="fa fa-plus" />}
  </button>;
}
