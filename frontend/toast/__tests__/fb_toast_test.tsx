import { fakeState } from "../../__test_support__/fake_state";
import { store } from "../../redux/store";
const mockState = fakeState();

import React from "react";
import TestRenderer from "react-test-renderer";
import { render } from "@testing-library/react";
import { Toast, ToastContainer, Toasts } from "../fb_toast";
import { ToastProps, ToastsProps } from "../interfaces";
import { fakeToasts } from "../../__test_support__/fake_toasts";
import { Path } from "../../internal_urls";

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
  const mountedWrappers: TestRenderer.ReactTestRenderer[] = [];

  afterEach(() => {
    mountedWrappers.splice(0).forEach(wrapper =>
      TestRenderer.act(() => wrapper.unmount()));
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
    const wrapper = TestRenderer.create(<Toast {...p} />);
    mountedWrappers.push(wrapper);
    return wrapper;
  };

  const getRootToast = (wrapper: TestRenderer.ReactTestRenderer) =>
    wrapper.root.findAll(
      node => node.type == "div" && node.props.className?.includes("toast "))[0];

  const getSpinner = (wrapper: TestRenderer.ReactTestRenderer) =>
    wrapper.root.findAll(
      node => node.type == "div" && node.props.className == "toast-loader-spinner")[0];

  it("renders", () => {
    const { container } = render(<Toast {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("message");
  });

  it("advances timer", () => {
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as Toast;
    expect(instance.state.timeout).toEqual(7);
    instance.advanceTimer();
    expect(instance.state.timeout).toEqual(6.9);
  });

  it("dismisses", () => {
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as Toast;
    expect(instance.state.dismissed).toEqual(false);
    expect(instance.state.detached).toEqual(false);
    instance.setState({ timeout: 0.5 });
    instance.advanceTimer();
    expect(instance.state.timeout).toEqual(0.4);
    expect(instance.state.dismissed).toEqual(true);
    expect(instance.state.detached).toEqual(true);
  });

  it("detaches", () => {
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as Toast;
    expect(instance.state.dismissed).toEqual(false);
    expect(instance.state.detached).toEqual(false);
    instance.setState({ timeout: -1 });
    instance.advanceTimer();
    expect(instance.state.timeout).toEqual(-1.1);
    expect(instance.state.dismissed).toEqual(true);
    expect(instance.state.detached).toEqual(true);
  });

  it("handles mouse enter events", () => {
    const wrapper = createWrapper();
    expect(getSpinner(wrapper)?.props.style?.animationPlayState)
      .toEqual("running");
    getRootToast(wrapper)?.props.onMouseEnter();
    expect(getSpinner(wrapper)?.props.style?.animationPlayState)
      .toEqual("paused");
  });

  it("handles mouse leave events", () => {
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as Toast;
    instance.setState({ isHovered: true });
    expect(getSpinner(wrapper)?.props.style?.animationPlayState)
      .toEqual("paused");
    getRootToast(wrapper)?.props.onMouseLeave();
    expect(getSpinner(wrapper)?.props.style?.animationPlayState)
      .toEqual("running");
  });

  it("handles clicks", () => {
    jest.useFakeTimers();
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as Toast;
    getRootToast(wrapper)?.props.onClick();
    jest.advanceTimersByTime(200 * 1.1);
    expect(getRootToast(wrapper)?.props.className).toContain("poof");
    expect(instance.state.dismissed).toBeTruthy();
  });

  it("doesn't allow toast dismissal", () => {
    const p = fakeProps();
    p.noDismiss = true;
    const wrapper = createWrapper(p);
    const instance = wrapper.getInstance() as Toast;
    expect(instance.state.dismissed).toBeFalsy();
    expect(getRootToast(wrapper)?.props.className).toContain("no-timer");
    getRootToast(wrapper)?.props.onClick();
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
    const instance = wrapper.getInstance() as Toast;
    instance.setState({ intervalId: 1 });
    wrapper.unmount();
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
