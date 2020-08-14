import { generateReducer } from "../redux/generate_reducer";
import { TaggedResource } from "farmbot";
import { Actions } from "../constants";

export interface PhotosState {
  currentImage: string | undefined;
  currentImageSize: Record<"height" | "width", number | undefined>;
}

export const photosState: PhotosState = {
  currentImage: undefined,
  currentImageSize: { width: undefined, height: undefined },
};

export const photosReducer = generateReducer<PhotosState>(photosState)
  .add<TaggedResource>(Actions.INIT_RESOURCE, (s, { payload }) => {
    if (payload.kind === "Image") {
      s.currentImage = payload.uuid;
      s.currentImageSize.width = undefined;
      s.currentImageSize.height = undefined;
    }
    return s;
  })
  .add<string>(Actions.SELECT_IMAGE, (s, { payload }) => {
    s.currentImage = payload;
    return s;
  })
  .add<Record<"height" | "width", number | undefined>>(
    Actions.SET_IMAGE_SIZE, (s, { payload }) => {
      s.currentImageSize = payload;
      return s;
    })
  .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s, { payload }) => {
    const thatUUID = payload.uuid;
    const thisUUID = s.currentImage;
    if (thisUUID === thatUUID) {
      s.currentImage = undefined;
      s.currentImageSize.width = undefined;
      s.currentImageSize.height = undefined;
    }
    return s;
  });
