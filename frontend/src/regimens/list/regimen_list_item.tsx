import * as React from "react";
import { RegimenListItemProps } from "../interfaces";
import { isMobile } from "../../util";
import { selectRegimen } from "../actions";
import { Link } from "react-router";
import { TaggedRegimen, isTaggedRegimen } from "../../resources/tagged_resources";

export function RegimenListItem({ regimen, dispatch }: RegimenListItemProps) {
  let name = regimen.body.name || "-";
  let color = (regimen.body.color) || "gray";
  let style = `block block-wrapper full-width text-left ${color}
        block-header fb-button`;
  let link = name ? name.replace(/ /g, "_").toLowerCase() : "-";
  if (isMobile()) {
    return <Link to={`/app/regimens/${link}`}
      key={regimen.uuid}
      onClick={select(dispatch, regimen)}
      className={style}>
      {name}
    </Link>;
  } else {
    return <button
      className={style}
      onClick={select(dispatch, regimen)}>
      {name} {regimen.dirty && ("*")}
      <i className="fa fa-pencil block-control" />
    </button>;
  }
}

function select(dispatch: Function, regimen: TaggedRegimen) {
  return function (event: React.MouseEvent<{}>) {
    if (regimen && isTaggedRegimen(regimen)) {
      dispatch(selectRegimen(regimen));
    }
  };
}
