import { Actions } from "../../constants";
import { TaggedImage } from "farmbot";
import { UUID } from "../../resources/interfaces";
import { unpackUUID } from "../../util";

export const selectImage = (uuid: string | undefined) => ({
  type: Actions.SELECT_IMAGE, payload: uuid,
});

export const highlightMapImage = (imageId: number | undefined) => ({
  type: Actions.HIGHLIGHT_MAP_IMAGE,
  payload: imageId,
});

export const toggleAlwaysHighlightImage =
  (value: boolean, image: TaggedImage | undefined) => (dispatch: Function) => {
    dispatch({
      type: Actions.SET_SHOWN_MAP_IMAGES,
      payload: (value || !image) ? [] : [image.body.id],
    });
    dispatch({
      type: Actions.TOGGLE_ALWAYS_HIGHLIGHT_IMAGE, payload: undefined,
    });
  };

export const toggleSingleImageMode =
  (image: TaggedImage | undefined) => (dispatch: Function) => {
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

export const setShownMapImages = (uuid: UUID | undefined) => ({
  type: Actions.SET_SHOWN_MAP_IMAGES,
  payload: uuid ? [unpackUUID(uuid).remoteId] : [],
});
