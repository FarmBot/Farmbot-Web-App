import * as React from "react";
import { RegimenListItemProps } from "../interfaces";
import { lastUrlChunk, urlFriendly } from "../../util";
import { selectRegimen } from "../actions";
import { t } from "i18next";
import { Content } from "../../constants";
import { Link } from "../../link";

export function RegimenListItem({ regimen, dispatch, inUse }: RegimenListItemProps) {
  const name = (regimen.body.name || "") + (regimen.specialStatus ? " *" : "");
  const color = regimen.body.color || "gray";
  const classNames = [`block`, `full-width`, `fb-button`, `${color}`];
  lastUrlChunk() === urlFriendly(regimen.body.name) && classNames.push("active");
  return <Link
    to={`/app/regimens/${urlFriendly(regimen.body.name)}`}
    key={regimen.uuid}>
    <button
      className={classNames.join(" ")}
      onClick={() => dispatch(selectRegimen(regimen.uuid))}>
      <label>{name}</label>
      {inUse && <i className="in-use fa fa-hdd-o" title={t(Content.IN_USE)} />}
    </button>
  </Link>;
}
