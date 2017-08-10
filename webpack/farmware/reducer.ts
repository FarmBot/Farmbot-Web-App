import { generateReducer } from "../redux/generate_reducer";
import { FarmwareState } from "./interfaces";
import { TaggedResource } from "../resources/tagged_resources";
import { Actions } from "../constants";

export let farmwareState: FarmwareState = { currentImage: undefined };

export let famrwareReducer = generateReducer<FarmwareState>(farmwareState)
  .add<string>(Actions.SELECT_IMAGE, (s, { payload }) => {
    s.currentImage = payload;
    return s;
  })
  .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s, { payload }) => {
    let thatUUID = payload.uuid;
    let thisUUID = s.currentImage;
    if (thisUUID === thatUUID) { s.currentImage = undefined; }
    return s;
  });
