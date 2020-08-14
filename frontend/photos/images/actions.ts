import { Actions } from "../../constants";
import { UUID } from "../../resources/interfaces";
import { unpackUUID } from "../../util";

export const selectImage = (uuid: string | undefined) => ({
  type: Actions.SELECT_IMAGE, payload: uuid,
});

export const highlightMapImage = (imageId: number | undefined) => ({
  type: Actions.HIGHLIGHT_MAP_IMAGE,
  payload: imageId,
});

export const setShownMapImages = (uuid: UUID | undefined) => ({
  type: Actions.SET_SHOWN_MAP_IMAGES,
  payload: uuid ? [unpackUUID(uuid).remoteId] : [],
});
