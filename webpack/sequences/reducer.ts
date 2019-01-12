import { SequenceReducerState } from "./interfaces";
import { generateReducer } from "../redux/generate_reducer";
import { TaggedResource } from "farmbot";
import { Actions } from "../constants";

export const initialState: SequenceReducerState = {
  current: undefined,
  menuOpen: false,
};

export let sequenceReducer = generateReducer<SequenceReducerState>(initialState)
  .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s, { payload }) => {
    switch (payload.uuid) {
      case s.current:
        s.current = undefined;
        break;
    }
    return s;
  })
  .add<string>(Actions.SELECT_SEQUENCE, function (s, { payload }) {
    s.current = payload;
    return s;
  })
  .add<boolean>(Actions.SET_SEQUENCE_POPUP_STATE, function (s, { payload }) {
    s.menuOpen = payload;
    return s;
  });
