jest.mock("fastclick", () => ({
  attach: jest.fn(),
}));

let mockAuth: AuthState | undefined = undefined;
jest.mock("../session", () => ({
  Session: {
    fetchStoredToken: jest.fn(() => mockAuth),
    deprecatedGetNum: () => undefined,
    deprecatedGetBool: () => undefined,
    getAll: () => undefined,
    clear: jest.fn()
  }
}));

let mockPathname = "";
jest.mock("../history", () => ({
  history: {
    getCurrentLocation: () => ({ pathname: mockPathname })
  }
}));

import * as React from "react";
import { shallow } from "enzyme";
import { RootComponent } from "../routes";
import { store } from "../redux/store";
import { AuthState } from "../auth/interfaces";
import { auth } from "../__test_support__/fake_state/token";
import { Session } from "../session";

describe("<RootComponent />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("clears session when not authorized", () => {
    mockAuth = undefined;
    mockPathname = "/app/account";
    shallow(<RootComponent store={store} />);
    expect(Session.clear).toHaveBeenCalled();
  });

  it("authorized", () => {
    mockAuth = auth;
    mockPathname = "/app/account";
    shallow(<RootComponent store={store} />);
    expect(Session.clear).not.toHaveBeenCalled();
  });
});
