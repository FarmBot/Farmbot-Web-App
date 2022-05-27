import React from "react";
import { shallow, mount } from "enzyme";
import { FlipperImage } from "../flipper_image";
import { FlipperImageProps } from "../interfaces";
import { PLACEHOLDER_FARMBOT, PLACEHOLDER_FARMBOT_DARK } from "../image_flipper";
import { fakeImage } from "../../../__test_support__/fake_state/resources";

describe("<FlipperImage />", () => {
  const fakeProps = (): FlipperImageProps => ({
    dispatch: jest.fn(),
    image: fakeImage(),
    crop: false,
    env: {},
    getConfigValue: jest.fn(),
    flipperId: "",
    transformImage: false,
    onImageLoad: jest.fn(),
  });

  it("renders placeholder", () => {
    const p = fakeProps();
    p.image.body.attachment_processed_at = undefined;
    const wrapper = mount(<FlipperImage {...p} />);
    expect(wrapper.find("img").first().props().src).toEqual(PLACEHOLDER_FARMBOT);
  });

  it("renders dark placeholder", () => {
    const p = fakeProps();
    p.image.body.attachment_processed_at = undefined;
    p.dark = true;
    const wrapper = mount(<FlipperImage {...p} />);
    expect(wrapper.find("img").first().props().src)
      .toEqual(PLACEHOLDER_FARMBOT_DARK);
  });

  it("renders placeholder at specific size", () => {
    Object.defineProperty(document, "getElementById", {
      value: () => ({ clientWidth: 200, clientHeight: 100 }),
      configurable: true
    });
    const p = fakeProps();
    p.image.body.attachment_processed_at = undefined;
    const wrapper = mount(<FlipperImage {...p} />);
    expect(wrapper.find("img").first().props().src).toEqual(PLACEHOLDER_FARMBOT);
    expect(wrapper.find("img").first().props().width).toEqual(200);
    expect(wrapper.find("img").first().props().height).toEqual(100);
  });

  it("renders placeholder at default size", () => {
    Object.defineProperty(document, "getElementById", {
      value: () => ({}), configurable: true
    });
    const p = fakeProps();
    p.image.body.attachment_processed_at = undefined;
    const wrapper = mount(<FlipperImage {...p} />);
    expect(wrapper.find("img").first().props().src).toEqual(PLACEHOLDER_FARMBOT);
    expect(wrapper.find("img").first().props().width).toEqual(undefined);
    expect(wrapper.find("img").first().props().height).toEqual(undefined);
  });

  it("knows when image is loaded", () => {
    const p = fakeProps();
    const wrapper = mount<FlipperImage>(<FlipperImage {...p} />);
    expect(wrapper.state().isLoaded).toEqual(false);
    wrapper.find("img").last().simulate("load", {
      currentTarget: { naturalWidth: 0, naturalHeight: 0 }
    });
    expect(wrapper.state().isLoaded).toEqual(true);
    expect(p.onImageLoad).toHaveBeenCalled();
  });

  it("transforms image", () => {
    const p = fakeProps();
    p.image.body.id = undefined;
    p.transformImage = true;
    p.crop = true;
    p.getConfigValue = () => 2;
    const wrapper = mount(<FlipperImage {...p} />);
    expect(wrapper.find("svg").length).toEqual(1);
  });

  it("calls back on transformed image load", () => {
    const p = fakeProps();
    const wrapper = shallow<FlipperImage>(<FlipperImage {...p} />);
    expect(wrapper.state()).toEqual({
      isLoaded: false, width: undefined, height: undefined,
    });
    const fakeImg = new Image();
    Object.defineProperty(fakeImg, "naturalWidth", {
      value: 1, configurable: true,
    });
    Object.defineProperty(fakeImg, "naturalHeight", {
      value: 2, configurable: true,
    });
    wrapper.instance().onImageLoad(fakeImg);
    expect(p.onImageLoad).toHaveBeenCalledWith(fakeImg);
    expect(wrapper.state()).toEqual({ isLoaded: true, width: 1, height: 2 });
  });

  it("hovers image", () => {
    const p = fakeProps();
    p.hover = jest.fn();
    const wrapper = mount(<FlipperImage {...p} />);
    wrapper.find(".image-jsx").simulate("mouseEnter");
    expect(p.hover).toHaveBeenCalledWith(p.image.uuid);
  });

  it("unhovers image", () => {
    const p = fakeProps();
    p.hover = jest.fn();
    const wrapper = mount(<FlipperImage {...p} />);
    wrapper.find(".image-jsx").simulate("mouseLeave");
    expect(p.hover).toHaveBeenCalledWith(undefined);
  });

  it("handles missing hover function", () => {
    const wrapper = mount(<FlipperImage {...fakeProps()} />);
    wrapper.find(".image-jsx").simulate("mouseEnter");
    wrapper.find(".image-jsx").simulate("mouseLeave");
  });
});
