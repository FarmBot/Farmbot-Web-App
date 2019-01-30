import { generateReducer } from "../redux/generate_reducer";
import { FarmwareState } from "./interfaces";
import { TaggedResource } from "farmbot";
import { Actions } from "../constants";

export let farmwareState: FarmwareState = {
  currentFarmware: undefined,
  currentImage: undefined,
  firstPartyFarmwareNames: []
};

export let farmwareReducer = generateReducer<FarmwareState>(farmwareState)
  .add<TaggedResource>(Actions.INIT_RESOURCE, (s, { payload }) => {
    if (payload.kind === "Image") {
      s.currentImage = payload.uuid;
    }
    return s;
  })
  .add<string>(Actions.SELECT_FARMWARE, (s, { payload }) => {
    s.currentFarmware = payload;
    return s;
  })
  .add<string>(Actions.SELECT_IMAGE, (s, { payload }) => {
    s.currentImage = payload;
    return s;
  })
  .add<string[]>(Actions.FETCH_FIRST_PARTY_FARMWARE_NAMES_OK, (s, { payload }) => {
    s.firstPartyFarmwareNames = payload;
    return s;
  })
  .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s, { payload }) => {
    const thatUUID = payload.uuid;
    const thisUUID = s.currentImage;
    if (thisUUID === thatUUID) { s.currentImage = undefined; }
    return s;
  });
