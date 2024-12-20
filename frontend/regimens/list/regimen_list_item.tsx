import React from "react";
import { RegimenListItemProps } from "../interfaces";
import { urlFriendly } from "../../util";
import { selectRegimen } from "../actions";
import { Content } from "../../constants";
import { t } from "../../i18next_wrapper";
import { useNavigate } from "react-router";
import { Path } from "../../internal_urls";
import { edit } from "../../api/crud";
import { ColorPicker } from "../../ui";

export function RegimenListItem(props: RegimenListItemProps) {
  const { regimen, dispatch, inUse } = props;
  const label = (regimen.body.name || "") + (regimen.specialStatus ? " *" : "");
  const navigate = useNavigate();
  return <div className={"regimen-search-item"}
    onClick={() => {
      dispatch(selectRegimen(regimen.uuid));
      navigate(Path.regimens(urlFriendly(regimen.body.name)));
    }}
    title={t("open regimen")}>
    <div className={"regimen-color"} onClick={e => e.stopPropagation()}>
      <ColorPicker
        current={regimen.body.color || "gray"}
        onChange={color => dispatch(edit(regimen, { color }))} />
    </div>
    <span className={"regimen-search-item-name"}>{label}</span>
    {inUse && <i className="in-use fa fa-hdd-o" title={t(Content.IN_USE)} />}
  </div>;
}
