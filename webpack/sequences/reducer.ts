import { SequenceReducerState } from "./interfaces";
import { generateReducer } from "../redux/generate_reducer";
import { TaggedResource } from "../resources/tagged_resources";
import { Actions } from "../constants";

export const initialState: SequenceReducerState = {
  current: undefined
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
  .add<TaggedResource>(Actions.INIT_RESOURCE, (s, { payload }) => {
    if (payload.kind === "Sequence") {
      s.current = payload.uuid;
    }
    return s;
  })
  .add<string>(Actions.SELECT_SEQUENCE, function (s, { payload }) {
    s.current = payload;
    return s;
  });
