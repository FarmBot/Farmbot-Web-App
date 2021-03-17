import React from "react";
import { QosPanel, QosPanelProps, colorFromPercentOK } from "../qos_panel";
import { fakePings } from "../../../__test_support__/fake_state/pings";
import { mount } from "enzyme";

describe("<QosPanel />", () => {
  const fakeProps = (): QosPanelProps => ({
    pings: fakePings(),
  });

  it("renders", () => {
    const wrapper = mount(<QosPanel {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("percent ok: 50 %");
    expect(wrapper.text()).not.toContain("---");
  });

  it("renders when empty", () => {
    const p = fakeProps();
    p.pings = {};
    const wrapper = mount(<QosPanel {...p} />);
    expect(wrapper.text()).toContain("---");
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
