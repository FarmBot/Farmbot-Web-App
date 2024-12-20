let mockAuth: AuthState | undefined = undefined;
jest.mock("../session", () => ({
  Session: {
    fetchStoredToken: jest.fn(() => mockAuth),
    getAll: () => undefined,
    clear: jest.fn()
  }
}));

import React from "react";
import { mount } from "enzyme";
import { RootComponent } from "../routes";
import { store } from "../redux/store";
import { AuthState } from "../auth/interfaces";
import { auth } from "../__test_support__/fake_state/token";
import { Session } from "../session";
import { Path } from "../internal_urls";

describe("<RootComponent />", () => {
  it("clears session when not authorized", () => {
    mockAuth = undefined;
    globalConfig.ROLLBAR_CLIENT_TOKEN = "abc";
    window.location.pathname = Path.mock(Path.logs());
    const wrapper = mount(<RootComponent store={store} />);
    expect(Session.clear).toHaveBeenCalled();
    wrapper.unmount();
  });

  it("authorized", () => {
    mockAuth = auth;
    globalConfig.ROLLBAR_CLIENT_TOKEN = "abc";
    window.location.pathname = Path.mock(Path.logs());
    const wrapper = mount(<RootComponent store={store} />);
    expect(Session.clear).not.toHaveBeenCalled();
    expect(wrapper.html()).toContain("rollbar");
    wrapper.unmount();
  });

  it("doesn't add rollbar", () => {
    mockAuth = auth;
    globalConfig.ROLLBAR_CLIENT_TOKEN = "";
    window.location.pathname = Path.mock(Path.logs());
    const wrapper = mount(<RootComponent store={store} />);
    expect(Session.clear).not.toHaveBeenCalled();
    expect(wrapper.html()).not.toContain("rollbar");
    wrapper.unmount();
  });
});
