import { fakeState } from "../../__test_support__/fake_state";
import { store } from "../../redux/store";
const mockState = fakeState();

import React from "react";
import { render } from "@testing-library/react";
import { Toast, ToastContainer, Toasts } from "../fb_toast";
import { ToastProps, ToastsProps } from "../interfaces";
import { fakeToasts } from "../../__test_support__/fake_toasts";
import { Path } from "../../internal_urls";
import {
  actRenderer,
  createRenderer,
  getRendererInstance,
  unmountRenderer,
} from "../../__test_support__/test_renderer";

let originalGetState: typeof store.getState;
let originalDispatch: typeof store.dispatch;

beforeEach(() => {
  originalGetState = store.getState;
  originalDispatch = store.dispatch;
  (store as unknown as { getState: () => typeof mockState }).getState =
    () => mockState;
  (store as unknown as { dispatch: jest.Mock }).dispatch = jest.fn();
});

afterEach(() => {
  (store as unknown as { getState: typeof store.getState }).getState =
    originalGetState;
  (store as unknown as { dispatch: typeof store.dispatch }).dispatch =
    originalDispatch;
});

describe("<Toast />", () => {
  const mountedWrappers: ReturnType<typeof createRenderer>[] = [];

  afterEach(() => {
    mountedWrappers.splice(0).forEach(wrapper =>
      unmountRenderer(wrapper));
  });

  const fakeProps = (): ToastProps => ({
    id: "id",
    dispatch: jest.fn(),
    message: "message",
    title: "title",
    color: "red",
    idPrefix: undefined,
    noTimer: undefined,
    noDismiss: undefined,
  });

  const createWrapper = (p = fakeProps()) => {
    const wrapper = createRenderer(
      <Toast {...p} />,
      "Failed to create Toast test wrapper.",
    );
    mountedWrappers.push(wrapper);
    return wrapper;
  };

  const getInstance = (wrapper: ReturnType<typeof createRenderer>) =>
    getRendererInstance<Toast, ToastProps>(wrapper, Toast);

  const getRootToast = (wrapper: ReturnType<typeof createRenderer>) =>
    wrapper.root.findAll(
      node => node.type == "div" && node.props.className?.includes("toast "))[0];

  const getSpinner = (wrapper: ReturnType<typeof createRenderer>) =>
    wrapper.root.findAll(
      node => node.type == "div" && node.props.className == "toast-loader-spinner")[0];

  it("renders", () => {
    const { container } = render(<Toast {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("message");
  });

  it("advances timer", () => {
    const wrapper = createWrapper();
    const instance = getInstance(wrapper);
    expect(instance.state.timeout).toEqual(7);
    actRenderer(() => {
      instance.advanceTimer();
    });
    expect(instance.state.timeout).toEqual(6.9);
  });

  it("dismisses", () => {
    const wrapper = createWrapper();
    const instance = getInstance(wrapper);
    expect(instance.state.dismissed).toEqual(false);
    expect(instance.state.detached).toEqual(false);
    actRenderer(() => {
      instance.setState({ timeout: 0.5 });
    });
    actRenderer(() => {
      instance.advanceTimer();
    });
    expect(instance.state.timeout).toEqual(0.4);
    expect(instance.state.dismissed).toEqual(true);
    expect(instance.state.detached).toEqual(true);
  });

  it("detaches", () => {
    const wrapper = createWrapper();
    const instance = getInstance(wrapper);
    expect(instance.state.dismissed).toEqual(false);
    expect(instance.state.detached).toEqual(false);
    actRenderer(() => {
      instance.setState({ timeout: -1 });
    });
    actRenderer(() => {
      instance.advanceTimer();
    });
    expect(instance.state.timeout).toEqual(-1.1);
    expect(instance.state.dismissed).toEqual(true);
    expect(instance.state.detached).toEqual(true);
  });

  it("handles mouse enter events", () => {
    const wrapper = createWrapper();
    expect(getSpinner(wrapper)?.props.style?.animationPlayState)
      .toEqual("running");
    actRenderer(() => {
      getRootToast(wrapper)?.props.onMouseEnter();
    });
    expect(getSpinner(wrapper)?.props.style?.animationPlayState)
      .toEqual("paused");
  });

  it("handles mouse leave events", () => {
    const wrapper = createWrapper();
    const instance = getInstance(wrapper);
    actRenderer(() => {
      instance.setState({ isHovered: true });
    });
    expect(getSpinner(wrapper)?.props.style?.animationPlayState)
      .toEqual("paused");
    actRenderer(() => {
      getRootToast(wrapper)?.props.onMouseLeave();
    });
    expect(getSpinner(wrapper)?.props.style?.animationPlayState)
      .toEqual("running");
  });

  it("handles clicks", () => {
    jest.useFakeTimers();
    const wrapper = createWrapper();
    const instance = getInstance(wrapper);
    actRenderer(() => {
      getRootToast(wrapper)?.props.onClick();
    });
    actRenderer(() => {
      jest.advanceTimersByTime(200 * 1.1);
    });
    expect(getRootToast(wrapper)?.props.className).toContain("poof");
    expect(instance.state.dismissed).toBeTruthy();
  });

  it("doesn't allow toast dismissal", () => {
    const p = fakeProps();
    p.noDismiss = true;
    const wrapper = createWrapper(p);
    const instance = getInstance(wrapper);
    expect(instance.state.dismissed).toBeFalsy();
    expect(getRootToast(wrapper)?.props.className).toContain("no-timer");
    actRenderer(() => {
      getRootToast(wrapper)?.props.onClick();
    });
    expect(getRootToast(wrapper)?.props.className).not.toContain("poof");
    expect(instance.state.dismissed).toBeFalsy();
  });

  it("doesn't run timer", () => {
    const p = fakeProps();
    p.noTimer = true;
    const wrapper = createWrapper(p);
    expect(getRootToast(wrapper)?.props.className).toContain("no-timer");
  });

  it("unmounts", () => {
    const wrapper = createWrapper();
    const instance = getInstance(wrapper);
    const intervalId = setInterval(() => undefined, 100);
    actRenderer(() => {
      instance.setState({ intervalId });
    });
    unmountRenderer(wrapper);
    clearInterval(intervalId);
  });

  it("redirects", () => {
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
    p.redirect = Path.plants();
    render(<Toast {...p} />);
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    p.redirect = Path.plants();
    render(<Toast {...p} />);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("<Toasts />", () => {
  const fakeProps = (): ToastsProps => ({
    toastMessages: fakeToasts(),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<Toasts {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("message");
  });
});

describe("<ToastContainer />", () => {
  it("renders", () => {
    mockState.app.toasts = fakeToasts();
    const { container } = render(<ToastContainer />);
    expect(container.textContent?.toLowerCase()).toContain("message");
  });
});
