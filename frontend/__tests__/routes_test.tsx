let mockAuth: AuthState | undefined = undefined;
jest.mock("../session", () => ({
  Session: {
    fetchStoredToken: jest.fn(() => mockAuth),
    getAll: () => undefined,
    clear: jest.fn()
  }
}));

jest.mock("takeme", () => ({
  Router: jest.fn(() => ({ enableHtml5Routing: () => ({ init: jest.fn() }) })),
}));

import React from "react";
import { shallow } from "enzyme";
import { AnyConnectedComponent, RootComponent } from "../routes";
import { store } from "../redux/store";
import { AuthState } from "../auth/interfaces";
import { auth } from "../__test_support__/fake_state/token";
import { Session } from "../session";
import { FourOhFour } from "../404";
import { Path } from "../internal_urls";

describe("<RootComponent />", () => {
  it("clears session when not authorized", () => {
    mockAuth = undefined;
    window.location.pathname = Path.mock(Path.logs());
    const wrapper = shallow(<RootComponent store={store} />);
    expect(Session.clear).toHaveBeenCalled();
    wrapper.unmount();
  });

  it("authorized", () => {
    mockAuth = auth;
    window.location.pathname = Path.mock(Path.logs());
    const wrapper = shallow(<RootComponent store={store} />);
    expect(Session.clear).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("changes route", () => {
    const wrapper = shallow<RootComponent>(<RootComponent store={store} />);
    wrapper.instance().changeRoute(FourOhFour);
    expect(wrapper.state().Route).toEqual(FourOhFour);
  });

  it("renders child route", () => {
    const wrapper = shallow<RootComponent>(<RootComponent store={store} />);
    wrapper.setState({
      ChildRoute: jest.fn(() =>
        <p>child</p>) as unknown as AnyConnectedComponent
    });
  });
});
