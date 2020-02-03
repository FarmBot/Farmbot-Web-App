let mockAuth: AuthState | undefined = undefined;
jest.mock("../session", () => ({
  Session: {
    fetchStoredToken: jest.fn(() => mockAuth),
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
import { FourOhFour } from "../404";

describe("<RootComponent />", () => {
  it("clears session when not authorized", () => {
    mockAuth = undefined;
    mockPathname = "/app/account";
    const wrapper = shallow(<RootComponent store={store} />);
    expect(Session.clear).toHaveBeenCalled();
    wrapper.unmount();
  });

  it("authorized", () => {
    mockAuth = auth;
    mockPathname = "/app/account";
    const wrapper = shallow(<RootComponent store={store} />);
    expect(Session.clear).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("changes route", () => {
    const wrapper = shallow<RootComponent>(<RootComponent store={store} />);
    wrapper.instance().changeRoute(FourOhFour);
    expect(wrapper.state().Route).toEqual(FourOhFour);
  });
});
