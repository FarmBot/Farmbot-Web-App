import * as React from "react";
import { Link } from "react-router";
import { RegimenListItemProps } from "../interfaces";
import { lastUrlChunk, urlFriendly } from "../../util";
import { selectRegimen } from "../actions";
import {
  TaggedRegimen,
  isTaggedRegimen
} from "../../resources/tagged_resources";

export function RegimenListItem({ regimen, dispatch }: RegimenListItemProps) {
  const name = regimen.body.name || "";
  const color = (regimen.body.color) || "gray";
  const style = [`block`, `full-width`, `fb-button`, `${color}`];
  lastUrlChunk() === urlFriendly(name) && style.push("active");

  return <Link
    to={`/app/regimens/${urlFriendly(name)}`}
    key={regimen.uuid}>
    <button
      className={style.join(" ")}
      onClick={select(dispatch, regimen)}>
      {name} {regimen.specialStatus && ("*")}
    </button>
  </Link>;
}

function select(dispatch: Function, regimen: TaggedRegimen) {
  return function () {
    if (regimen && isTaggedRegimen(regimen)) {
      dispatch(selectRegimen(regimen));
    }
  };
}
