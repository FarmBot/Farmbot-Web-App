import React from "react";
import { mount, shallow } from "enzyme";
import { ImageWorkspace, ImageWorkspaceProps } from "../index";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import { TaggedImage } from "farmbot";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { clickButton } from "../../../__test_support__/helpers";
import { inputEvent } from "../../../__test_support__/fake_html_events";
import { ExpandableHeader } from "../../../ui";

describe("<ImageWorkspace />", () => {
  const fakeProps = (): ImageWorkspaceProps => ({
    onProcessPhoto: jest.fn(),
    onChange: jest.fn(),
    currentImage: undefined as TaggedImage | undefined,
    images: [] as TaggedImage[],
    iteration: 9,
    morph: 9,
    blur: 9,
    H_LO: 2,
    S_LO: 4,
    V_LO: 6,
    H_HI: 8,
    S_HI: 10,
    V_HI: 12,
    botOnline: true,
    timeSettings: fakeTimeSettings(),
    namespace: jest.fn(() => "CAMERA_CALIBRATION_H_HI"),
    highlightModified: false,
  });

  it("triggers onChange() event", () => {
    const props = fakeProps();
    const iw = new ImageWorkspace(props);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (iw as any).props = props;
    iw.onHslChange("H")([4, 5]);
    expect(props.onChange).toHaveBeenCalledTimes(2);
    expect(props.onChange).toHaveBeenCalledWith("H_HI", 5);
    expect(props.onChange).toHaveBeenCalledWith("H_LO", 4);
    jest.clearAllMocks();
    iw.onHslChange("H")([2, 5]);
    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledWith("H_HI", 5);
    jest.clearAllMocks();
    iw.onHslChange("H")([4, 8]);
    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledWith("H_LO", 4);
    jest.clearAllMocks();
    iw.onHslChange("H")([2, 8]);
    expect(props.onChange).not.toHaveBeenCalled();
  });

  it("triggers numericChange()", () => {
    const props = fakeProps();
    const iw = new ImageWorkspace(props);
    iw.numericChange("blur")(inputEvent("23"));
    expect(props.onChange).toHaveBeenCalledWith("blur", 23);
  });

  it("handles null", () => {
    const props = fakeProps();
    const iw = new ImageWorkspace(props);
    iw.numericChange("blur")(inputEvent(""));
    expect(props.onChange).toHaveBeenCalledWith("blur", 0);
  });

  it("doesn't process photo", () => {
    const p = fakeProps();
    const iw = new ImageWorkspace(p);
    iw.maybeProcessPhoto();
    expect(p.onProcessPhoto).not.toHaveBeenCalled();
  });

  it("processes selected photo", () => {
    const p = fakeProps();
    const photo1 = fakeImage();
    photo1.body.id = 1;
    const photo2 = fakeImage();
    photo2.body.id = 2;
    p.images = [photo1, photo2];
    p.currentImage = photo2;
    const iw = new ImageWorkspace(p);
    iw.maybeProcessPhoto();
    expect(p.onProcessPhoto).toHaveBeenCalledWith(photo2.body.id);
  });

  it("scans image", () => {
    const image = fakeImage();
    const p = fakeProps();
    p.botOnline = true;
    p.images = [image];
    p.currentImage = image;
    const wrapper = mount(<ImageWorkspace {...p} />);
    clickButton(wrapper, 0, "scan current image");
    expect(p.onProcessPhoto).toHaveBeenCalledWith(image.body.id);
  });

  it("disables scan image button when offline", () => {
    const p = fakeProps();
    p.botOnline = false;
    const wrapper = mount(<ImageWorkspace {...p} />);
    expect(wrapper.find("button").first().props().disabled).toBeTruthy();
  });

  it("opens", () => {
    const wrapper = shallow<ImageWorkspace>(<ImageWorkspace {...fakeProps()} />);
    expect(wrapper.state().open).toEqual(false);
    wrapper.find(ExpandableHeader).simulate("click");
    expect(wrapper.state().open).toEqual(true);
  });

  it("returns the modified class", () => {
    const p = fakeProps();
    p.blur = 7;
    p.highlightModified = true;
    const iw = new ImageWorkspace(p);
    expect(iw.getModifiedClass("blur")).toEqual("modified");
  });

  it("doesn't return the modified class", () => {
    const p = fakeProps();
    p.blur = 7;
    p.highlightModified = false;
    const iw = new ImageWorkspace(p);
    expect(iw.getModifiedClass("blur")).toEqual("");
  });
});
