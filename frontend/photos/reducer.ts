import { generateReducer } from "../redux/generate_reducer";
import { TaggedResource } from "farmbot";
import { Actions } from "../constants";
import { UUID } from "../resources/interfaces";
import { PhotosPanelState } from "./interfaces";

export interface PhotosState {
  currentImage: UUID | undefined;
  currentImageSize: Record<"height" | "width", number | undefined>;
  photosPanelState: PhotosPanelState;
}

export const photosState: PhotosState = {
  currentImage: undefined,
  currentImageSize: { width: undefined, height: undefined },
  photosPanelState: {
    filter: false,
    camera: false,
    calibration: false,
    detection: false,
    measure: false,
    manage: false,
    calibrationPP: false,
    detectionPP: false,
  },
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
  .add<UUID | undefined>(Actions.SELECT_IMAGE, (s, { payload }) => {
    s.currentImage = payload;
    return s;
  })
  .add<Record<"height" | "width", number | undefined>>(
    Actions.SET_IMAGE_SIZE, (s, { payload }) => {
      s.currentImageSize = payload;
      return s;
    })
  .add<keyof PhotosPanelState>(Actions.TOGGLE_PHOTOS_PANEL_OPTION, (s, a) => {
    s.photosPanelState[a.payload] = !s.photosPanelState[a.payload];
    return s;
  })
  .add<boolean>(
    Actions.BULK_TOGGLE_PHOTOS_PANEL, (s, a) => {
      s.photosPanelState.filter = a.payload;
      s.photosPanelState.camera = a.payload;
      s.photosPanelState.calibration = a.payload;
      s.photosPanelState.detection = a.payload;
      s.photosPanelState.measure = a.payload;
      s.photosPanelState.manage = a.payload;
      s.photosPanelState.calibrationPP = a.payload;
      s.photosPanelState.detectionPP = a.payload;
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
