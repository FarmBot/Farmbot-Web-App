import React from "react";
import { RegimenListItemProps } from "../interfaces";
import { urlFriendly } from "../../util";
import { selectRegimen } from "../actions";
import { Content } from "../../constants";
import { t } from "../../i18next_wrapper";
import { push } from "../../history";
import { RegimenColorPicker } from "../editor/regimen_edit_components";
import { Path } from "../../internal_urls";

export function RegimenListItem(props: RegimenListItemProps) {
  const { regimen, dispatch, inUse } = props;
  const label = (regimen.body.name || "") + (regimen.specialStatus ? " *" : "");
  return <div className={"regimen-search-item"}
    onClick={() => {
      dispatch(selectRegimen(regimen.uuid));
      push(Path.regimens(urlFriendly(regimen.body.name)));
    }}
    title={t("open regimen")}>
    <div className={"regimen-color"} onClick={e => e.stopPropagation()}>
      <RegimenColorPicker regimen={regimen} dispatch={dispatch} />
    </div>
    <span className={"regimen-search-item-name"}>{label}</span>
    {inUse && <i className="in-use fa fa-hdd-o" title={t(Content.IN_USE)} />}
  </div>;
}
