import * as React from "react";
import { Link } from "react-router";
import { RegimenListItemProps } from "../interfaces";
import { lastUrlChunk, urlFriendly } from "../../util";
import { selectRegimen } from "../actions";
import {
  TaggedRegimen,
  isTaggedRegimen
} from "../../resources/tagged_resources";
import { t } from "i18next";
import { Content } from "../../constants";

export function RegimenListItem({ regimen, dispatch }: RegimenListItemProps) {
  const name = (regimen.body.name || "") + (regimen.specialStatus ? " *" : "");
  const color = (regimen.body.color) || "gray";
  const style = [`block`, `full-width`, `fb-button`, `${color}`];
  lastUrlChunk() === urlFriendly(regimen.body.name) && style.push("active");

  return <Link
    to={`/app/regimens/${urlFriendly(name)}`}
    key={regimen.uuid}>
    <button
      className={style.join(" ")}
      onClick={select(dispatch, regimen)}>
      <label>{name}</label>
      {regimen.body.in_use &&
        <i className="in-use fa fa-hdd-o" title={t(Content.IN_USE)} />}
    </button>
  </Link>;
}

function select(dispatch: Function, regimen: TaggedRegimen) {
  return function () {
    if (regimen && isTaggedRegimen(regimen)) {
      dispatch(selectRegimen(regimen.uuid));
    }
  };
}
