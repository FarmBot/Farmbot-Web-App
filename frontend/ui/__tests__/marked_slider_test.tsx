import React from "react";
import { shallow } from "enzyme";
import { MarkedSlider, MarkedSliderProps } from "../marked_slider";
import { fakeImage } from "../../__test_support__/fake_state/resources";
import { MultiSlider, Slider } from "@blueprintjs/core";
import { TaggedImage } from "farmbot";

describe("<MarkedSlider />", () => {
  const fakeProps = (): MarkedSliderProps<TaggedImage> => ({
    min: 0,
    max: 100,
    labelStepSize: 1,
    value: 10,
    items: [fakeImage(), fakeImage(), fakeImage()],
    onChange: jest.fn(),
    labelRenderer: () => "",
    itemValue: () => 1,
  });

  it("displays slider", () => {
    const p = fakeProps();
    const wrapper = shallow(<MarkedSlider {...p} />);
    expect(wrapper.html()).not.toContain("vertical");
    expect(wrapper.find(Slider).length).toEqual(1);
    expect(wrapper.find(MultiSlider.Handle).length).toEqual(3);
  });

  it("displays vertical slider", () => {
    const p = fakeProps();
    p.vertical = true;
    const wrapper = shallow(<MarkedSlider {...p} />);
    expect(wrapper.html()).toContain("vertical");
    expect(wrapper.find(Slider).length).toEqual(1);
    expect(wrapper.find(MultiSlider.Handle).length).toEqual(3);
  });
});
