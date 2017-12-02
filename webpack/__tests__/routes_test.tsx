jest.mock("fastclick", () => ({
  attach: jest.fn(),
}));

import { auth } from "../__test_support__/fake_state/token";
const mockAuth = auth;
const mockClear = jest.fn();
jest.mock("../session", () => ({
  Session: {
    fetchStoredToken: jest.fn(() => mockAuth)
      .mockImplementationOnce(() => { }),
    getNum: () => undefined,
    getBool: () => undefined,
    getAll: () => undefined,
    clear: mockClear
  }
}));

import * as React from "react";
import { shallow } from "enzyme";
import { RootComponent } from "../routes";
import { store } from "../redux/store";

describe("<RootComponent />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("clears session when not authorized", () => {
    Object.defineProperty(location, "pathname", {
      value: "/app/account"
    });
    shallow(<RootComponent store={store} />);
    expect(mockClear).toHaveBeenCalled();
  });

  it("authorized", () => {
    Object.defineProperty(location, "pathname", {
      value: "/app/account"
    });
    shallow(<RootComponent store={store} />);
    expect(mockClear).not.toHaveBeenCalled();
  });
});
