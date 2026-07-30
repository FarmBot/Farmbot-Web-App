import { TaggedRegimen } from "farmbot";
import { NavigateFunction } from "react-router";
import { init } from "../api/crud";
import { t } from "../i18next_wrapper";
import { Path } from "../internal_urls";
import { defensiveClone, urlFriendly } from "../util";
import { setActiveRegimenByName } from "./set_active_regimen_by_name";

let count = 1;

export const copyRegimen = (
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
