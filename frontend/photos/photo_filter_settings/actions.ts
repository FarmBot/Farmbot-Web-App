import { Actions } from "../../constants";
import { TaggedImage } from "farmbot";
import { StringValueUpdate } from "./interfaces";
import { GetState } from "../../redux/interfaces";
import * as resourceGetters from "../../resources/getters";
import * as crud from "../../api/crud";

export const toggleAlwaysHighlightImage =
  (value: boolean, image: TaggedImage | undefined) => (dispatch: Function) =>
    () => {
      dispatch({
        type: Actions.SET_SHOWN_MAP_IMAGES,
        payload: (value || !image) ? [] : [image.body.id],
      });
      dispatch({
        type: Actions.TOGGLE_ALWAYS_HIGHLIGHT_IMAGE, payload: undefined,
      });
    };

export const toggleSingleImageMode =
  (image: TaggedImage | undefined) => (dispatch: Function) => () => {
    dispatch({
      type: Actions.SET_SHOWN_MAP_IMAGES,
      payload: image?.body.id ? [image.body.id] : [],
    });
    dispatch({
      type: Actions.TOGGLE_SHOWN_IMAGES_ONLY, payload: undefined,
    });
  };

export const toggleHideImage =
  (notHidden: boolean, imageId: number | undefined) => ({
    type: notHidden ? Actions.HIDE_MAP_IMAGE : Actions.UN_HIDE_MAP_IMAGE,
    payload: imageId,
  });

export const toggleShowPhotoImages = (dispatch: Function) => () =>
  dispatch({
    type: Actions.TOGGLE_SHOW_PHOTO_IMAGES, payload: undefined,
  });

export const toggleShowCalibrationImages = (dispatch: Function) => () =>
  dispatch({
    type: Actions.TOGGLE_SHOW_CALIBRATION_IMAGES, payload: undefined,
  });

export const toggleShowDetectionImages = (dispatch: Function) => () =>
  dispatch({
    type: Actions.TOGGLE_SHOW_DETECTION_IMAGES, payload: undefined,
  });

export const toggleShowHeightImages = (dispatch: Function) => () =>
  dispatch({
    type: Actions.TOGGLE_SHOW_HEIGHT_IMAGES, payload: undefined,
  });

export const setWebAppConfigValues = (update: StringValueUpdate) =>
  (dispatch: Function, getState: GetState) => {
    const webAppConfig =
      resourceGetters.getWebAppConfig(getState().resources.index);
    if (webAppConfig) {
      dispatch(crud.edit(webAppConfig, update));
      dispatch(crud.save(webAppConfig.uuid));
    }
  };
