jest.mock("../../../../settings/index", () => ({
  showByEveryTerm: () => true,
}));

import React from "react";
import { shallow, mount } from "enzyme";
import {
  Bugs, BugsProps, showBugResetButton, showBugs, resetBugs, BugsControls,
  BugsSettings,
} from "../bugs";
import { EggKeys, setEggStatus, getEggStatus } from "../status";
import { range } from "lodash";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { FilePath } from "../../../../internal_urls";

const expectAlive = (value: string) =>
  expect(getEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE)).toEqual(value);

describe("<Bugs />", () => {
  const fakeProps = (): BugsProps => ({
    mapTransformProps: fakeMapTransformProps(),
    botSize: {
      x: { value: 3000, isDefault: true },
      y: { value: 1500, isDefault: true },
      z: { value: 400, isDefault: true },
    },
  });

  it("renders", () => {
    const wrapper = svgMount(<Bugs {...fakeProps()} />);
    expect(wrapper.find("image").length).toEqual(10);
    const firstBug = wrapper.find("image").first();
    expect(firstBug.props()).toEqual(expect.objectContaining({
      className: expect.stringContaining("bug"),
      filter: "",
      opacity: 1,
      xlinkHref: expect.stringContaining(FilePath.bug())
    }));
  });

  it("kills bugs", () => {
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "");
    expectAlive("");
    const wrapper = svgMount(<Bugs {...fakeProps()} />);
    wrapper.find(Bugs).state().bugs[0].r = 101;
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
    expect(wrapper.find(Bugs).state().bugs[0]).toEqual(expect.objectContaining({
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

describe("<BugsControls />", () => {
  it("lays eggs", () => {
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "");
    const noEggs = shallow(<BugsControls />);
    expect(noEggs.find(".more-bugs").length).toEqual(0);
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "true");
    const stillNoEggs = shallow(<BugsControls />);
    expect(stillNoEggs.find(".more-bugs").length).toEqual(0);
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "false");
    const eggs = shallow(<BugsControls />);
    expect(eggs.find(".more-bugs").length).toEqual(1);
  });
});

describe("<BugsSettings />", () => {
  it("toggles setting on", () => {
    localStorage.setItem(EggKeys.BRING_ON_THE_BUGS, "");
    const wrapper = mount(<BugsSettings />);
    expect(wrapper.text().toLowerCase()).toContain("bug");
    wrapper.find("button").last().simulate("click");
    expect(localStorage.getItem(EggKeys.BRING_ON_THE_BUGS)).toEqual("true");
  });

  it("toggles setting off", () => {
    localStorage.setItem(EggKeys.BRING_ON_THE_BUGS, "true");
    const wrapper = mount(<BugsSettings />);
    expect(wrapper.text().toLowerCase()).toContain("bug");
    wrapper.find("button").last().simulate("click");
    expect(localStorage.getItem(EggKeys.BRING_ON_THE_BUGS)).toEqual("");
  });
});
