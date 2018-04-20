import * as React from "react";
import { shallow, mount } from "enzyme";
import { Bugs, BugsProps, showBugResetButton, showBugs, resetBugs } from "../bugs";
import { EggKeys, setEggStatus, getEggStatus } from "../status";
import { range } from "lodash";
import { fakeMapTransformProps } from "../../../../__test_support__/map_transform_props";

const expectAlive = (value: string) =>
  expect(getEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE)).toEqual(value);

describe("<Bugs />", () => {
  const fakeProps = (): BugsProps => ({
    mapTransformProps: fakeMapTransformProps(),
    botSize: {
      x: { value: 3000, isDefault: true },
      y: { value: 1500, isDefault: true }
    },
  });

  it("renders", () => {
    const wrapper = shallow(<Bugs {...fakeProps()} />);
    expect(wrapper.find("image").length).toEqual(10);
    const firstBug = wrapper.find("image").first();
    expect(firstBug.props()).toEqual(expect.objectContaining({
      className: expect.stringContaining("bug"),
      filter: "",
      opacity: 1,
      xlinkHref: "/app-resources/img/generic-plant.svg"
    }));
  });

  it("kills bugs", () => {
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "");
    expectAlive("");
    const wrapper = mount(<Bugs {...fakeProps()} />);
    wrapper.state().bugs[0].r = 101;
    range(10).map(b =>
      wrapper.find("image").at(b).simulate("click"));
    expectAlive("");
    range(10).map(b =>
      wrapper.find("image").at(b).simulate("click"));
    expectAlive("false");
    wrapper.mount(); // update elements (state has changed)
    expect(wrapper.find("image").first().props())
      .toEqual(expect.objectContaining({
        className: expect.stringContaining("dead"),
        filter: expect.stringContaining("grayscale")
      }));
    expect(wrapper.state().bugs[0]).toEqual(expect.objectContaining({
      alive: false, hp: 50
    }));
  });
});

describe("showBugResetButton()", () => {
  it("is truthy", () => {
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "true");
    expect(showBugResetButton()).toBeTruthy();
  });
  it("is falsy", () => {
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "");
    expect(showBugResetButton()).toBeFalsy();
  });
});

describe("showBugs()", () => {
  it("is truthy", () => {
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "true");
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "true");
    expect(showBugs()).toBeTruthy();
  });
  it("is falsy", () => {
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "");
    expect(showBugs()).toBeFalsy();
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "true");
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "false");
    expect(showBugs()).toBeFalsy();
  });
});

describe("resetBugs()", () => {
  it("resets bugs", () => {
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "false");
    resetBugs();
    expectAlive("true");
  });
});
