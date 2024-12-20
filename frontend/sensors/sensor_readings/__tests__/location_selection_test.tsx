import React from "react";
import { mount, shallow } from "enzyme";
import { LocationSelection, LocationDisplay } from "../location_selection";
import { LocationSelectionProps } from "../interfaces";

describe("<LocationSelection />", () => {
  function fakeProps(): LocationSelectionProps {
    return {
      xyzLocation: undefined,
      deviation: 0,
      setLocation: jest.fn(),
      setDeviation: jest.fn(),
    };
  }

  it("renders", () => {
    const wrapper = mount(<LocationSelection {...fakeProps()} />);
    const txt = wrapper.text().toLowerCase();
    ["x", "y", "z", "deviation"]
      .map(string => expect(txt).toContain(string));
  });

  it("changes location", () => {
    const p = fakeProps();
    p.xyzLocation = { x: 10, y: 20, z: 30 };
    const wrapper = mount(<LocationSelection {...p} />);
    wrapper.find("input").first().simulate("submit");
    expect(p.setLocation).toHaveBeenCalledWith({ x: 10, y: 20, z: 30 });
  });

  it("changes location: undefined", () => {
    const p = fakeProps();
    p.xyzLocation = undefined;
    const wrapper = mount(<LocationSelection {...p} />);
    wrapper.find("input").first().simulate("submit");
    expect(p.setLocation).toHaveBeenCalledWith({ x: undefined });
  });

  it("changes deviation", () => {
    const p = fakeProps();
    const wrapper = shallow(<LocationSelection {...p} />);
    wrapper.find("BlurableInput").first().simulate("commit",
      { currentTarget: { value: "100" } });
    expect(p.setDeviation).toHaveBeenCalledWith(100);
  });
});

describe("<LocationDisplay />", () => {
  it("renders location ranges", () => {
    const p = { xyzLocation: { x: 10, y: 20, z: 30 }, deviation: 2 };
    const wrapper = mount(<LocationDisplay {...p} />);
    const txt = wrapper.text().toLowerCase();
    ["x", "y", "z", "8–12", "18–22", "28–32"]
      .map(string => expect(txt).toContain(string));
  });
});
