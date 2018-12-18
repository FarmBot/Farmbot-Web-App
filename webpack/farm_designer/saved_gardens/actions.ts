import axios from "axios";
import { API } from "../../api";
import { t } from "i18next";
import { success, info } from "farmbot-toastr";
import { history } from "../../history";
import { Actions } from "../../constants";
import { destroy, initSave, initSaveGetId } from "../../api/crud";
import { unpackUUID } from "../../util";
import { isString } from "lodash";
import { TaggedSavedGarden, TaggedPlantTemplate } from "farmbot";

/** Save all Plant to PlantTemplates in a new SavedGarden. */
export const snapshotGarden = (name?: string | undefined) =>
  axios.post<void>(API.current.snapshotPath, name ? { name } : {})
    .then(() => success(t("Garden Saved.")));

export const unselectSavedGarden = {
  type: Actions.CHOOSE_SAVED_GARDEN,
  payload: undefined
};

/** Save a SavedGarden's PlantTemplates as Plants. */
export const applyGarden = (gardenId: number) => (dispatch: Function) => axios
  .patch<void>(API.current.applyGardenPath(gardenId))
  .then(() => {
    history.push("/app/designer/plants");
    dispatch(unselectSavedGarden);
    const busyToastTitle = t("Please wait");
    info(t("while your garden is applied."), busyToastTitle, "blue");
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

/** Open a SavedGarden if it is closed, otherwise close it. */
export const openOrCloseGarden = (props: {
  savedGarden: string | undefined,
  gardenIsOpen: boolean,
  dispatch: Function
}) => () =>
    !props.gardenIsOpen && isString(props.savedGarden)
      ? props.dispatch(openSavedGarden(props.savedGarden))
      : props.dispatch(closeSavedGarden());

/** Create a new SavedGarden with the chosen name. */
export const newSavedGarden = (name: string) =>
  (dispatch: Function) => {
    dispatch(initSave("SavedGarden", { name: name || "Untitled Garden" }));
  };

/** Create a copy of a PlantTemplate body and assign it a new SavedGarden. */
const newPTBody =
  (source: TaggedPlantTemplate, newSGId: number): TaggedPlantTemplate["body"] =>
    ({
      name: source.body.name,
      openfarm_slug: source.body.openfarm_slug,
      saved_garden_id: newSGId,
      radius: source.body.radius,
      x: source.body.x,
      y: source.body.y,
      z: source.body.z,
    });

/** Copy a SavedGarden and all of its PlantTemplates. */
export const copySavedGarden = ({ newSGName, savedGarden, plantTemplates }: {
  newSGName: string,
  savedGarden: TaggedSavedGarden,
  plantTemplates: TaggedPlantTemplate[]
}) =>
  (dispatch: Function) => {
    const sourceSavedGardenId = savedGarden.body.id;
    const name = newSGName || `${savedGarden.body.name} (${t("copy")})`;
    dispatch(initSaveGetId(savedGarden.kind, { name }))
      .then((newSGId: number) => plantTemplates
        .filter(x => x.body.saved_garden_id === sourceSavedGardenId)
        .map(x => dispatch(initSave(x.kind, newPTBody(x, newSGId)))));
  };
