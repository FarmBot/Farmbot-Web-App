import { generateReducer } from "../redux/generate_reducer";
import { FarmwareState } from "./interfaces";
import { Actions } from "../constants";

export const farmwareState: FarmwareState = {
  currentFarmware: undefined,
  firstPartyFarmwareNames: [],
  infoOpen: false,
};

export const farmwareReducer = generateReducer<FarmwareState>(farmwareState)
  .add<string>(Actions.SELECT_FARMWARE, (s, { payload }) => {
    s.currentFarmware = payload;
    return s;
  })
  .add<string[]>(Actions.FETCH_FIRST_PARTY_FARMWARE_NAMES_OK, (s, { payload }) => {
    s.firstPartyFarmwareNames = payload;
    return s;
  })
  .add<boolean>(Actions.SET_FARMWARE_INFO_STATE, (s, { payload }) => {
    s.infoOpen = payload;
    return s;
  });
