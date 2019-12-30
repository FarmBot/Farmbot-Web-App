import { noop } from "lodash";
import { Everything } from "../interfaces";
import { auth } from "./fake_state/token";
import { bot } from "./fake_state/bot";
import { config } from "./fake_state/config";
import { draggable } from "./fake_state/draggable";
import { resources } from "./fake_state/resources";

/** Factory function for empty state object. */
export function fakeState(_: Function = noop): Everything {
  return {
    dispatch: jest.fn(),
    auth,
    bot,
    config,
    draggable,
    resources
  };
}
