import axios from "axios";
import { API } from "../../api";
import { success, info } from "../../toast/toast";
import { history } from "../../history";
import { Actions } from "../../constants";
import { destroy, initSave, initSaveGetId } from "../../api/crud";
import { unpackUUID } from "../../util";
import { isString } from "lodash";
import { TaggedSavedGarden, TaggedPlantTemplate } from "farmbot";
import { t } from "../../i18next_wrapper";
import { stopTracking } from "../../connectivity/data_consistency";

/** Save all Plant to PlantTemplates in a new SavedGarden. */
export const snapshotGarden = (gardenName?: string | undefined) =>
  axios.post<void>(API.current.snapshotPath, gardenName
    ? { name: gardenName } : {})
    .then(() => {
      success(t("Garden Saved."));
      history.push("/app/designer/gardens");
    });

export const unselectSavedGarden = {
  type: Actions.CHOOSE_SAVED_GARDEN,
  payload: undefined
};

/** Save a SavedGarden's PlantTemplates as Plants. */
export const applyGarden = (gardenId: number) => (dispatch: Function) => axios
  .patch<void>(API.current.applyGardenPath(gardenId))
  .then(data => {
    stopTracking(data.headers["x-farmbot-rpc-id"]);
    history.push("/app/designer/plants");
    dispatch(unselectSavedGarden);
    const busyToastTitle = t("Please wait");
    info(t("while your garden is applied."), busyToastTitle, "blue");
  });

export const destroySavedGarden = (uuid: string) => (dispatch: Function) => {
  dispatch(unselectSavedGarden);
  history.push("/app/designer/gardens");
  dispatch(destroy(uuid));
};

export const closeSavedGarden = () => {
  history.push("/app/designer/gardens");
  return (dispatch: Function) =>
    dispatch(unselectSavedGarden);
};

export const openSavedGarden = (savedGarden: string) => {
  history.push("/app/designer/gardens/" + unpackUUID(savedGarden).remoteId);
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
export const newSavedGarden = (gardenName: string) =>
  (dispatch: Function) => {
    dispatch(initSave("SavedGarden", { name: gardenName || "Untitled Garden" }))
      .then(() => {
        success(t("Garden Saved."));
        history.push("/app/designer/gardens");
      });
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
    const gardenName = newSGName || `${savedGarden.body.name} (${t("copy")})`;
    dispatch(initSaveGetId(savedGarden.kind, { name: gardenName }))
      .then((newSGId: number) => {
        plantTemplates
          .filter(x => x.body.saved_garden_id === sourceSavedGardenId)
          .map(x => dispatch(initSave(x.kind, newPTBody(x, newSGId))));
        success(t("Garden Saved."));
        history.push("/app/designer/gardens");
      });
  };
