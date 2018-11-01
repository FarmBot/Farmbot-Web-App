import axios from "axios";
import { API } from "../../api";
import { t } from "i18next";
import { success } from "farmbot-toastr";
import { history } from "../../history";
import { Actions } from "../../constants";
import { destroy, initSave } from "../../api/crud";
import { unpackUUID } from "../../util";
import { isString } from "lodash";

export const snapshotGarden = (name?: string | undefined) =>
  axios.post<void>(API.current.snapshotPath, name ? { name } : {})
    .then(() => success(t("Garden Saved.")));

const unselectSavedGarden = {
  type: Actions.CHOOSE_SAVED_GARDEN,
  payload: undefined
};

export const applyGarden = (gardenId: number) => (dispatch: Function) => axios
  .patch<void>(API.current.applyGardenPath(gardenId))
  .then(() => {
    history.push("/app/designer/plants");
    dispatch(unselectSavedGarden);
  });

export const destroySavedGarden = (uuid: string) => (dispatch: Function) => {
  dispatch(destroy(uuid))
    .then(dispatch(unselectSavedGarden))
    .catch(() => { });
};

export const closeSavedGarden = () => {
  history.push("/app/designer/saved_gardens");
  return (dispatch: Function) =>
    dispatch(unselectSavedGarden);
};

export const openSavedGarden = (savedGarden: string) => {
  history.push("/app/designer/saved_gardens/" + unpackUUID(savedGarden).remoteId);
  return (dispatch: Function) =>
    dispatch({ type: Actions.CHOOSE_SAVED_GARDEN, payload: savedGarden });
};

export const openOrCloseGarden = (props: {
  savedGarden: string | undefined,
  gardenIsOpen: boolean,
  dispatch: Function
}) => () =>
    !props.gardenIsOpen && isString(props.savedGarden)
      ? props.dispatch(openSavedGarden(props.savedGarden))
      : props.dispatch(closeSavedGarden());

export const newSavedGarden = (name: string) =>
  (dispatch: Function) => {
    dispatch(initSave("SavedGarden", { name: name || "Untitled Garden" }));
  };
