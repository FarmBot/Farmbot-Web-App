import { Actions } from "../constants";

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
