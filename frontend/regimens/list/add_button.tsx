import * as React from "react";
import { AddRegimenProps } from "../interfaces";
import { push } from "../../history";
import { TaggedRegimen } from "farmbot";
import { init } from "../../api/crud";
import { setActiveRegimenByName } from "../set_active_regimen_by_name";
import { urlFriendly } from "../../util";
import { t } from "../../i18next_wrapper";

const emptyRegimenBody = (length: number): TaggedRegimen["body"] => ({
  name: (t("New regimen ") + (length++)),
  color: "gray",
  regimen_items: [],
  body: [],
});

export function AddRegimen(props: AddRegimenProps) {
  props.className ? props.className : "";
  const classes = "fb-button green add " + props.className;
  const { dispatch, length } = props;
  return <button
    className={classes}
    onClick={() => {
      const newRegimen = emptyRegimenBody(length);
      dispatch(init("Regimen", newRegimen));
      push("/app/regimens/" + urlFriendly(newRegimen.name));
      setActiveRegimenByName();
    }}>
    {props.children || <i className="fa fa-plus" />}
  </button>;
}
