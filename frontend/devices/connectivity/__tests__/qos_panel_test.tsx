import React from "react";
import { QosPanel, QosPanelProps, colorFromPercentOK } from "../qos_panel";
import { fakePings } from "../../../__test_support__/fake_state/pings";
import { mount } from "enzyme";
import { Actions } from "../../../constants";

describe("<QosPanel />", () => {
  const fakeProps = (): QosPanelProps => ({
    pings: fakePings(),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<QosPanel {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("percent ok: 50 %");
    expect(wrapper.html()).toContain("green");
    expect(wrapper.text()).not.toContain("---");
  });

  it("renders slow pings", () => {
    const p = fakeProps();
    p.pings = { "ping": { kind: "complete", start: 0, end: 700 } };
    const wrapper = mount(<QosPanel {...p} />);
    expect(wrapper.html()).toContain("yellow");
  });

  it("renders slower pings", () => {
    const p = fakeProps();
    p.pings = { "ping": { kind: "complete", start: 0, end: 1000 } };
    const wrapper = mount(<QosPanel {...p} />);
    expect(wrapper.html()).toContain("red");
  });

  it("renders when empty", () => {
    const p = fakeProps();
    p.pings = {};
    const wrapper = mount(<QosPanel {...p} />);
    expect(wrapper.text()).toContain("---");
  });

  it("calls onFocus callback", () => {
    const p = fakeProps();
    const wrapper = mount<QosPanel>(<QosPanel {...p} />);
    wrapper.mount();
    wrapper.instance().onFocus();
    expect(p.dispatch).toHaveBeenCalledWith(
      { type: Actions.CLEAR_PINGS, payload: undefined });
    wrapper.unmount();
  });
});

describe("colorFromPercentOK()", () => {
  it("returns green", () => {
    expect(colorFromPercentOK(1)).toEqual("green");
    expect(colorFromPercentOK(0.9)).toEqual("green");
  });

  it("returns yellow", () => {
    expect(colorFromPercentOK(0.8)).toEqual("yellow");
    expect(colorFromPercentOK(0.89)).toEqual("yellow");
  });

  it("returns red", () => {
    expect(colorFromPercentOK(0.79)).toEqual("red");
    expect(colorFromPercentOK(0)).toEqual("red");
  });
});
