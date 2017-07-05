import * as React from "react";
import { noop } from "lodash";
import { Everything } from "../interfaces";
import { location } from "./fake_state/location";
import { peripherals } from "./fake_state/peripherals";
import { auth } from "./fake_state/token";
import { bot } from "./fake_state/bot";
import { config } from "./fake_state/config";
import { draggable } from "./fake_state/draggable";
import { resources } from "./fake_state/resources";

/** Factory function for empty state object. */
export function fakeState(dispatcher: Function = noop): Everything {
  return {
    dispatch: jest.fn(),
    router: { push: jest.fn() },
    location,
    peripherals,
    auth,
    bot,
    config,
    draggable,
    resources
  };
}
