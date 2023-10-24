import { RunButtonMenuOpen, SequenceReducerState } from "./interfaces";
import { generateReducer } from "../redux/generate_reducer";
import { TaggedResource } from "farmbot";
import { Actions } from "../constants";

export const initialState: SequenceReducerState = {
  current: undefined,
  menuOpen: { component: undefined, uuid: undefined },
  stepIndex: undefined,
};

export const sequenceReducer = generateReducer<SequenceReducerState>(initialState)
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
  .add<RunButtonMenuOpen>(Actions.SET_SEQUENCE_POPUP_STATE, (s, { payload }) => {
    s.menuOpen = payload;
    return s;
  })
  .add<number | undefined>(Actions.SET_SEQUENCE_STEP_POSITION,
    function (s, { payload }) {
      s.stepIndex = payload;
      return s;
    });
