import React from "react";
import { CopyButtonProps } from "./interfaces";
import { init } from "../../api/crud";
import { TaggedRegimen } from "farmbot";
import { defensiveClone, urlFriendly } from "../../util";
import { NavigateFunction, useNavigate } from "react-router";
import { setActiveRegimenByName } from "../set_active_regimen_by_name";
import { t } from "../../i18next_wrapper";
import { Path } from "../../internal_urls";

export const CopyButton = ({ dispatch, regimen }: CopyButtonProps) => {
  const navigate = useNavigate();
  return <i className={"fa fa-clone fb-icon-button"}
    title={t("copy")}
    onClick={() => dispatch(copyRegimen(navigate, regimen))} />;
};

let count = 1;

const copyRegimen = (
  navigate: NavigateFunction,
  payload: TaggedRegimen,
) =>
  (dispatch: Function) => {
    const copy = defensiveClone(payload);
    copy.body.id = undefined;
    copy.body.name = copy.body.name + t(" copy ") + (count++);
    dispatch(init(copy.kind, copy.body));
    navigate(Path.regimens(urlFriendly(copy.body.name)));
    setActiveRegimenByName();
  };
