import * as React from "react";
import { AddRegimenProps } from "../interfaces";
import { push } from "../../history";
import { TaggedRegimen } from "../../resources/tagged_resources";
import { init } from "../../api/crud";

function emptyRegimen(length: number): TaggedRegimen {
  return {
    kind: "regimens",
    uuid: "NEVER",
    dirty: true,
    body: {
      name: ("New regimen " + (length++)),
      color: "gray",
      regimen_items: []
    }
  };
}

export function AddRegimen(props: AddRegimenProps) {
  props.className ? props.className : "";
  let classes = "fb-button green add " + props.className;
  let { dispatch, length } = props;
  return (
    <button
      className={classes}
      onClick={() => {
        dispatch(init(emptyRegimen(length)));
        push("/app/regimens/new_regimen_" + (length++));
      }}>
      {props.children || <i className="fa fa-plus" />}
    </button>
  );
}
