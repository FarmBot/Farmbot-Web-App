import { Actions } from "../constants";
import { TaggedSceneObject } from "farmbot";
import { NavigateFunction } from "react-router";
import { GetState } from "../redux/interfaces";
import { selectAllSceneObjects } from "../resources/selectors";
import { init, save } from "../api/crud";
import { t } from "../i18next_wrapper";
import { Path } from "../internal_urls";

export const setFocusedSceneObjectField = (field: string | undefined) => ({
  type: Actions.SET_FOCUSED_SCENE_OBJECT_FIELD,
  payload: field,
});

export const setUnifiedSceneObjectSize = (uuid: string | undefined) => ({
  type: Actions.SET_UNIFIED_SCENE_OBJECT_SIZE,
  payload: uuid,
});

export const sceneObjectFocusHandler = (dispatch: Function) =>
  (field: string | undefined) =>
    dispatch(setFocusedSceneObjectField(field));

export const duplicateSceneObjectName = (
  sceneObjects: TaggedSceneObject[],
  sceneObject: TaggedSceneObject,
) => {
  const existingNames = sceneObjects.map(item => item.body.name);
  let count = 1;
  const copyName = () =>
    `${sceneObject.body.name} ${t("copy")} ${count}`;
  while (existingNames.includes(copyName())) { count++; }
  return copyName();
};

export const copySceneObject = (
  sceneObject: TaggedSceneObject,
  navigate: NavigateFunction,
) =>
  (dispatch: Function, getState: GetState) => {
    const sceneObjects = selectAllSceneObjects(getState().resources.index);
    const action = init("SceneObject", {
      ...sceneObject.body,
      id: undefined,
      name: duplicateSceneObjectName(sceneObjects, sceneObject),
    });
    dispatch(action);
    return dispatch(save(action.payload.uuid))
      .then(() => {
        const copy = selectAllSceneObjects(getState().resources.index)
          .filter(item => item.uuid == action.payload.uuid)[0];
        copy?.body.id && navigate(Path.sceneObjects(copy.body.id));
      })
      .catch(() => undefined);
  };
