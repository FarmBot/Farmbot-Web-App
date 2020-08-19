import React from "react";
import { shallow } from "enzyme";
import { CaptureSizeSelection } from "../capture_size_selection";
import { CaptureSizeSelectionProps } from "../interfaces";
import { FBSelect } from "../../../ui";

describe("<CaptureSizeSelection />", () => {
  const fakeProps = (): CaptureSizeSelectionProps => ({
    env: {},
    saveFarmwareEnv: jest.fn(),
    dispatch: jest.fn(),
  });

  it("changes custom capture size", () => {
    const p = fakeProps();
    p.env = { take_photo_width: "200", take_photo_height: "100" };
    const wrapper = shallow(<CaptureSizeSelection {...p} />);
    expect(wrapper.find(FBSelect).props().selectedItem?.value).toEqual("custom");
    wrapper.find(FBSelect).simulate("change", { label: "", value: "custom" });
    expect(p.saveFarmwareEnv).not.toHaveBeenCalled();
    wrapper.find("BlurableInput").at(0).simulate("commit", {
      currentTarget: { value: "400" }
    });
    wrapper.find("BlurableInput").at(1).simulate("commit", {
      currentTarget: { value: "300" }
    });
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("take_photo_width", "400");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("take_photo_height", "300");
  });

  it("changes preset capture size", () => {
    const p = fakeProps();
    p.env = {};
    const wrapper = shallow(<CaptureSizeSelection {...p} />);
    expect(wrapper.find(FBSelect).props().selectedItem?.value).toEqual("640x480");
    wrapper.find(FBSelect).simulate("change", { label: "", value: "320x240" });
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("take_photo_width", "320");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("take_photo_height", "240");
  });

  it.each<[string, number, number, number, number]>([
    ["1600x1200", 1600, 1200, 1600, 1200],
    ["maximum", 5001, 5001, 10000, 10000],
  ])("changes preset capture size: %s",
    (selection, width, height, expectedWidth, expectedHeight) => {
      const p = fakeProps();
      p.env = { take_photo_width: "" + width, take_photo_height: "" + height };
      const wrapper = shallow(<CaptureSizeSelection {...p} />);
      expect(wrapper.find(FBSelect).props().selectedItem?.value)
        .toEqual(selection);
      wrapper.find(FBSelect).simulate("change", { label: "", value: selection });
      expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
        "take_photo_width", "" + expectedWidth);
      expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
        "take_photo_height", "" + expectedHeight);
    });
});
