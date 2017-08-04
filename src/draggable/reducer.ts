import { generateReducer } from "../redux/generate_reducer";
import { DraggableState, DataXfer } from "./interfaces";
import { Actions } from "../constants";

const INITIAL_STATE: DraggableState = {
  dataTransfer: {}
};

export let draggableReducer = generateReducer<DraggableState>(INITIAL_STATE)
  .add<DataXfer>(Actions.PUT_DATA_XFER, (s, { payload }) => {
    s.dataTransfer[payload.uuid] = payload;
    return s;
  })
  .add<string>(Actions.DROP_DATA_XFER, (s, { payload }) => {
    delete s.dataTransfer[payload];
    return s;
  });
