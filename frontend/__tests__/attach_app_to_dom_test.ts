const util = require("../util/page");
util.attachToRoot = jest.fn();

import { fakeState } from "../__test_support__/fake_state";
jest.mock("../redux/store", () => ({
  store: {
    dispatch: jest.fn(),
    getState: fakeState,
  },
}));

jest.mock("../settings/dev/dev_support", () => ({
  DevSettings: {
    futureFeaturesEnabled: () => false,
    overriddenFbosVersion: jest.fn(),
  }
}));

jest.mock("../config/actions", () => ({ ready: jest.fn() }));

import { attachAppToDom, RootComponent } from "../routes";
import { attachToRoot } from "../util";
import { store } from "../redux/store";
import { ready } from "../config/actions";

describe("attachAppToDom()", () => {
  it("attaches RootComponent to the DOM", () => {
    attachAppToDom();
    expect(attachToRoot).toHaveBeenCalledWith(RootComponent, { store });
    expect(ready).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(ready());
  });
});
