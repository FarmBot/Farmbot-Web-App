import * as React from "react";
import { AddRegimenProps } from "../interfaces";
import { newRegimen } from "../actions";

export function AddRegimen(props: AddRegimenProps) {
  props.className ? props.className : "";
  let classes = "fb-button green " + props.className;
  let { dispatch } = props;
  return <button
    className={classes}
    onClick={() => dispatch(newRegimen())}
  >
    {props.children || <i className="fa fa-plus" />}
  </button>;
}

