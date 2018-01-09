const mockStorj: Dictionary<boolean> = {};

jest.mock("../session", () => {
  return {
    Session: {
      getBool: (k: string) => {
        mockStorj[k] = !!mockStorj[k];
        return mockStorj[k];
      }
    }
  };
});

import { Dictionary } from "farmbot";
import * as React from "react";
import { LoadingPlant } from "../loading_plant";
import { shallow } from "enzyme";
import { BooleanSetting } from "../session_keys";

describe("<LoadingPlant/>", () => {
  it("renders loading text", () => {
    mockStorj[BooleanSetting.disable_animations] = true;
    const wrapper = shallow(<LoadingPlant />);
    expect(wrapper.find(".loading-plant").length).toEqual(0);
    expect(wrapper.find(".loading-plant-text").props().y).toEqual(150);
    expect(wrapper.text()).toContain("Loading");
    expect(wrapper.find(".animate").length).toEqual(0);
  });

  it("renders loading animation", () => {
    mockStorj[BooleanSetting.disable_animations] = false;
    const wrapper = shallow(<LoadingPlant />);
    expect(wrapper.find(".loading-plant")).toBeTruthy();
    const circleProps = wrapper.find(".loading-plant-circle").props();
    expect(circleProps.r).toEqual(110);
    expect(circleProps.cx).toEqual(150);
    expect(circleProps.cy).toEqual(250);
    expect(wrapper.find(".loading-plant-text").props().y).toEqual(435);
    expect(wrapper.text()).toContain("Loading");
    expect(wrapper.find(".animate").length).toEqual(1);
  });
});
