import * as React from "react";
import { RegimenListItemProps } from "../interfaces";
import { lastUrlChunk, urlFriendly } from "../../util";
import { selectRegimen } from "../actions";
import {
  isTaggedRegimen
} from "../../resources/tagged_resources";
import { t } from "i18next";
import { Content } from "../../constants";
import { TaggedRegimen } from "farmbot";
import { Link } from "../../link";

export function RegimenListItem({ regimen, dispatch, inUse }: RegimenListItemProps) {
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
      {inUse && <i className="in-use fa fa-hdd-o" title={t(Content.IN_USE)} />}
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
