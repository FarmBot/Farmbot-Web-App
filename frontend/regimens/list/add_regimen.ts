import { TaggedRegimen } from "farmbot";
import { init } from "../../api/crud";
import { setActiveRegimenByName } from "../set_active_regimen_by_name";
import { urlFriendly } from "../../util";
import { t } from "../../i18next_wrapper";
import { Path } from "../../internal_urls";
import { NavigateFunction } from "react-router";

const emptyRegimenBody = (regimenCount: number): TaggedRegimen["body"] => ({
  name: (t("New Regimen ") + (regimenCount++)),
  color: "gray",
  regimen_items: [],
  body: [],
});

export const addRegimen = (regimenCount: number, navigate: NavigateFunction) =>
  (dispatch: Function) => {
    const newRegimen = emptyRegimenBody(regimenCount);
    dispatch(init("Regimen", newRegimen));
    navigate(Path.regimens(urlFriendly(newRegimen.name)));
    setActiveRegimenByName();
  };
