import * as React from "react";
import { LoadingPlant } from "../loading_plant";
import { shallow } from "enzyme";

describe("<LoadingPlant/>", () => {
  it("renders loading text", () => {
    const wrapper = shallow(<LoadingPlant animate={false} />);
    expect(wrapper.find(".loading-plant").length).toEqual(0);
    expect(wrapper.find(".loading-plant-text").props().y).toEqual(150);
    expect(wrapper.text()).toContain("Loading");
    expect(wrapper.find(".animate").length).toEqual(0);
    wrapper.unmount();
  });

  it("renders loading animation", () => {
    const wrapper = shallow(<LoadingPlant animate={true} />);
    expect(wrapper.find(".loading-plant")).toBeTruthy();
    const circleProps = wrapper.find(".loading-plant-circle").props();
    expect(circleProps.r).toEqual(110);
    expect(circleProps.cx).toEqual(150);
    expect(circleProps.cy).toEqual(250);
    expect(wrapper.find(".loading-plant-text").props().y).toEqual(435);
    expect(wrapper.text()).toContain("Loading");
    expect(wrapper.find(".animate").length).toEqual(1);
    wrapper.unmount();
  });
});
