import axios from "axios";
import { API } from "../api";
import { success, info } from "../toast/toast";
import { Actions } from "../constants";
import { destroy, initSave, initSaveGetId } from "../api/crud";
import { TaggedSavedGarden, TaggedPlantTemplate } from "farmbot";
import { t } from "../i18next_wrapper";
import { stopTracking } from "../connectivity/data_consistency";
import { Path } from "../internal_urls";
import { NavigateFunction } from "react-router";

/** Save all Plant to PlantTemplates in a new SavedGarden. */
export const snapshotGarden = (
  navigate: Function,
  gardenName?: string | undefined,
  gardenNotes?: string,
) => {
  return axios.post<void>(API.current.snapshotPath,
    gardenName
      ? { name: gardenName, notes: gardenNotes }
      : {})
    .then(() => {
      success(t("Garden Saved."));
      navigate(Path.plants());
    });
};

export const unselectSavedGarden = {
  type: Actions.CHOOSE_SAVED_GARDEN,
  payload: undefined
};

/** Save a SavedGarden's PlantTemplates as Plants. */
export const applyGarden = (navigate: Function, gardenId: number) =>
  (dispatch: Function) => axios
    .patch<void>(API.current.applyGardenPath(gardenId))
    .then(data => {
      stopTracking(data.headers["x-farmbot-rpc-id"] as string);
      navigate(Path.plants());
      dispatch(unselectSavedGarden);
      const busyToastTitle = t("Please wait");
      info(t("while your garden is applied."), { title: busyToastTitle });
    });

export const destroySavedGarden = (
  navigate: NavigateFunction,
  uuid: string,
) => (dispatch: Function) => {
  dispatch(unselectSavedGarden);
  navigate(Path.plants());
  dispatch(destroy(uuid));
};

export const closeSavedGarden = (navigate: NavigateFunction) => {
  navigate(Path.plants());
  return (dispatch: Function) =>
    dispatch(unselectSavedGarden);
};

export const openSavedGarden = (
  navigate: NavigateFunction,
  savedGardenId: number | undefined,
) => {
  navigate(Path.savedGardens(savedGardenId));
  return (dispatch: Function) =>
    dispatch({ type: Actions.CHOOSE_SAVED_GARDEN, payload: savedGardenId });
};

/** Open a SavedGarden if it is closed, otherwise close it. */
export const openOrCloseGarden = (props: {
  navigate: NavigateFunction,
  savedGardenId: number | undefined,
  gardenIsOpen: boolean,
  dispatch: Function
}) =>
  () =>
    !props.gardenIsOpen && props.savedGardenId
      ? props.dispatch(openSavedGarden(props.navigate, props.savedGardenId))
      : props.dispatch(closeSavedGarden(props.navigate));

/** Create a new SavedGarden with the chosen name. */
export const newSavedGarden = (
  navigate: NavigateFunction,
  gardenName: string,
  gardenNotes: string,
) =>
  (dispatch: Function) => {
    dispatch(initSave("SavedGarden", {
      name: gardenName || "Untitled Garden",
      notes: gardenNotes,
    }))
      .then(() => {
        success(t("Garden Saved."));
        navigate(Path.plants());
      });
  };

/** Create a copy of a PlantTemplate body and assign it a new SavedGarden. */
const newPTBody =
  (source: TaggedPlantTemplate, newSGId: number): TaggedPlantTemplate["body"] => ({
    name: source.body.name,
    openfarm_slug: source.body.openfarm_slug,
    saved_garden_id: newSGId,
    radius: source.body.radius,
    x: source.body.x,
    y: source.body.y,
    z: source.body.z,
  });

/** Copy a SavedGarden and all of its PlantTemplates. */
export const copySavedGarden = (props: {
  navigate: NavigateFunction,
  newSGName: string,
  savedGarden: TaggedSavedGarden,
  plantTemplates: TaggedPlantTemplate[]
}) =>
  (dispatch: Function) => {
    const { newSGName, savedGarden, plantTemplates, navigate } = props;
    const sourceSavedGardenId = savedGarden.body.id;
    const gardenName = newSGName || `${savedGarden.body.name} (${t("copy")})`;
    dispatch(initSaveGetId(savedGarden.kind, { name: gardenName }))
      .then((newSGId: number) => {
        plantTemplates
          .filter(x => x.body.saved_garden_id === sourceSavedGardenId)
          .map(x => dispatch(initSave(x.kind, newPTBody(x, newSGId))));
        success(t("Garden Saved."));
        navigate(Path.plants());
      });
  };
