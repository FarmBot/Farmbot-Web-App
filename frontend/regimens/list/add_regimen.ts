import { push } from "../../history";
import { TaggedRegimen } from "farmbot";
import { init } from "../../api/crud";
import { setActiveRegimenByName } from "../set_active_regimen_by_name";
import { urlFriendly } from "../../util";
import { t } from "../../i18next_wrapper";
import { Path } from "../../internal_urls";

const emptyRegimenBody = (regimenCount: number): TaggedRegimen["body"] => ({
  name: (t("New Regimen ") + (regimenCount++)),
  color: "gray",
  regimen_items: [],
  body: [],
});

export const addRegimen = (regimenCount: number) => (dispatch: Function) => {
  const newRegimen = emptyRegimenBody(regimenCount);
  dispatch(init("Regimen", newRegimen));
  push(Path.regimens(urlFriendly(newRegimen.name)));
  setActiveRegimenByName();
};
