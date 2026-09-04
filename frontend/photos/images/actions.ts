import { TaggedImage } from "farmbot";
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

export const setShownMapImages = (
  image: UUID | TaggedImage | undefined,
) => {
  const imageId = typeof image == "string"
    ? unpackUUID(image).remoteId
    : image?.body.id;
  return {
    type: Actions.SET_SHOWN_MAP_IMAGES,
    payload: imageId ? [imageId] : [],
  };
};
