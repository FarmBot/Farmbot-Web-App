import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";
import { APIStatus } from "./interfaces";

type State = APIStatus | undefined;

export let connectivityReducer = generateReducer<State>(undefined)
  .add<string>(Actions.NETWORK_UP, (s, { payload }) => {
    return { state: "up", at: payload };
  })
  .add<string>(Actions.NETWORK_DOWN, (s, { payload }) => {
    return { state: "down", at: payload };
  });
