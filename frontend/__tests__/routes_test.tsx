import React from "react";
import { render } from "@testing-library/react";
import { store } from "../redux/store";
import { AuthState } from "../auth/interfaces";
import { auth } from "../__test_support__/fake_state/token";
import { Session } from "../session";
import { Path } from "../internal_urls";
import { RootComponent } from "../routes";

describe("<RootComponent />", () => {
  let mockAuth: AuthState | undefined = undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth = undefined;
    jest.spyOn(Session, "fetchStoredToken").mockImplementation(() => mockAuth);
    jest.spyOn(Session, "clear").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("clears session when not authorized", () => {
    mockAuth = undefined;
    globalConfig.ROLLBAR_CLIENT_TOKEN = "abc";
    window.location.pathname = Path.mock(Path.logs());
    const instance = new RootComponent({ store });
    instance.UNSAFE_componentWillMount();
    expect(Session.clear).toHaveBeenCalled();
  });

  it("authorized", () => {
    mockAuth = auth;
    globalConfig.ROLLBAR_CLIENT_TOKEN = "abc";
    window.location.pathname = Path.mock(Path.logs());
    const { container } = render(<RootComponent store={store} />);
    expect(Session.clear).not.toHaveBeenCalled();
    expect(container.innerHTML).toContain("rollbar");
  });

  it("doesn't add rollbar", () => {
    mockAuth = auth;
    globalConfig.ROLLBAR_CLIENT_TOKEN = "";
    window.location.pathname = Path.mock(Path.logs());
    const { container } = render(<RootComponent store={store} />);
    expect(Session.clear).not.toHaveBeenCalled();
    expect(container.innerHTML).not.toContain("rollbar");
  });
});
