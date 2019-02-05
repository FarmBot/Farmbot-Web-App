import * as React from "react";
import { CopyButtonProps } from "./interfaces";
import { t } from "i18next";
import { init } from "../../api/crud";
import { TaggedRegimen } from "farmbot";
import { defensiveClone, urlFriendly } from "../../util";
import { push } from "../../history";
import { setActiveRegimenByName } from "../set_active_regimen_by_name";

export const CopyButton = ({ dispatch, regimen }: CopyButtonProps) =>
  <button
    className="fb-button yellow"
    onClick={() => dispatch(copyRegimen(regimen))}>
    {t("Copy")}
  </button>;

let count = 1;

export const copyRegimen = (payload: TaggedRegimen) =>
  (dispatch: Function) => {
    const copy = defensiveClone(payload);
    copy.body.id = undefined;
    copy.body.name = copy.body.name + t(" copy ") + (count++);
    dispatch(init(copy.kind, copy.body));
    push("/app/regimens/" + urlFriendly(copy.body.name));
    setActiveRegimenByName();
  };
