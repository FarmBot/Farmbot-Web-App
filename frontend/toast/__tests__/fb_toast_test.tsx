import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../redux/store", () => ({
  store: {
    dispatch: jest.fn(),
    getState: () => mockState,
  }
}));

import React from "react";
import { mount } from "enzyme";
import { Toast, ToastContainer, Toasts } from "../fb_toast";
import { ToastProps, ToastsProps } from "../interfaces";
import { fakeToasts } from "../../__test_support__/fake_toasts";
import { Path } from "../../internal_urls";

describe("<Toast />", () => {
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

  it("renders", () => {
    const wrapper = mount(<Toast {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("message");
  });

  it("advances timer", () => {
    const wrapper = mount<Toast>(<Toast {...fakeProps()} />);
    expect(wrapper.state().timeout).toEqual(7);
    wrapper.instance().advanceTimer();
    expect(wrapper.state().timeout).toEqual(6.9);
  });

  it("dismisses", () => {
    const wrapper = mount<Toast>(<Toast {...fakeProps()} />);
    expect(wrapper.state().dismissed).toEqual(false);
    expect(wrapper.state().detached).toEqual(false);
    wrapper.setState({ timeout: 0.5 });
    wrapper.instance().advanceTimer();
    expect(wrapper.state().timeout).toEqual(0.4);
    expect(wrapper.state().dismissed).toEqual(true);
    expect(wrapper.state().detached).toEqual(true);
  });

  it("detaches", () => {
    const wrapper = mount<Toast>(<Toast {...fakeProps()} />);
    expect(wrapper.state().dismissed).toEqual(false);
    expect(wrapper.state().detached).toEqual(false);
    wrapper.setState({ timeout: -1 });
    wrapper.instance().advanceTimer();
    expect(wrapper.state().timeout).toEqual(-1.1);
    expect(wrapper.state().dismissed).toEqual(true);
    expect(wrapper.state().detached).toEqual(true);
  });

  it("handles mouse enter events", () => {
    const wrapper = mount(<Toast {...fakeProps()} />);
    expect(wrapper.find(".toast-loader-spinner").props().style?.animationPlayState)
      .toEqual("running");
    wrapper.find("div").first().simulate("mouseEnter");
    expect(wrapper.find(".toast-loader-spinner").props().style?.animationPlayState)
      .toEqual("paused");
  });

  it("handles mouse leave events", () => {
    const wrapper = mount(<Toast {...fakeProps()} />);
    wrapper.setState({ isHovered: true });
    expect(wrapper.find(".toast-loader-spinner").props().style?.animationPlayState)
      .toEqual("paused");
    wrapper.find("div").first().simulate("mouseLeave");
    expect(wrapper.find(".toast-loader-spinner").props().style?.animationPlayState)
      .toEqual("running");
  });

  it("handles clicks", () => {
    jest.useFakeTimers();
    const wrapper = mount<Toast>(<Toast {...fakeProps()} />);
    wrapper.find("div").first().simulate("click");
    jest.advanceTimersByTime(200 * 1.1);
    expect(wrapper.find("div").first().hasClass("poof")).toBeTruthy();
    expect(wrapper.state().dismissed).toBeTruthy();
  });

  it("doesn't allow toast dismissal", () => {
    const p = fakeProps();
    p.noDismiss = true;
    const wrapper = mount<Toast>(<Toast {...p} />);
    expect(wrapper.state().dismissed).toBeFalsy();
    expect(wrapper.find("div").first().hasClass("no-timer")).toBeTruthy();
    wrapper.find("div").first().simulate("click");
    expect(wrapper.find("div").first().hasClass("poof")).toBeFalsy();
    expect(wrapper.state().dismissed).toBeFalsy();
  });

  it("doesn't run timer", () => {
    const p = fakeProps();
    p.noTimer = true;
    const wrapper = mount(<Toast {...p} />);
    expect(wrapper.find("div").first().hasClass("no-timer")).toBeTruthy();
  });

  it("unmounts", () => {
    const wrapper = mount(<Toast {...fakeProps()} />);
    wrapper.setState({ intervalId: 1 });
    wrapper.unmount();
  });

  it("redirects", () => {
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
    p.redirect = Path.plants();
    mount(<Toast {...p} />);
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    p.redirect = Path.plants();
    mount(<Toast {...p} />);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("<Toasts />", () => {
  const fakeProps = (): ToastsProps => ({
    toastMessages: fakeToasts(),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<Toasts {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("message");
  });
});

describe("<ToastContainer />", () => {
  it("renders", () => {
    mockState.app.toasts = fakeToasts();
    const wrapper = mount(<ToastContainer />);
    expect(wrapper.text().toLowerCase()).toContain("message");
  });
});
