import { Actions } from "../constants";

export function networkUp(payload = (new Date()).toJSON()) {
  return {
    type: Actions.NETWORK_UP,
    payload
  };
}

export function networkDown(payload = (new Date()).toJSON()) {
  return {
    type: Actions.NETWORK_DOWN,
    payload
  };
}
