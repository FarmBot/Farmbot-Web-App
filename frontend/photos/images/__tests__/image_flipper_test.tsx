import React from "react";
import { shallow, mount } from "enzyme";
import { ImageFlipper, PLACEHOLDER_FARMBOT } from "../image_flipper";
import { fakeImages } from "../../../__test_support__/fake_state/images";
import { TaggedImage } from "farmbot";
import { defensiveClone } from "../../../util";
import { ImageFlipperProps } from "../interfaces";
import { Actions } from "../../../constants";

describe("<ImageFlipper/>", () => {
  function prepareImages(data: TaggedImage[]): TaggedImage[] {
    const images: TaggedImage[] = [];
    data.forEach((item, index) => {
      const image = defensiveClone(item);
      image.uuid = `Position ${index}`;
      images.push(image);
    });
    return images;
  }

  const fakeProps = (): ImageFlipperProps => ({
    dispatch: jest.fn(),
    images: prepareImages(fakeImages),
    currentImage: undefined,
    currentImageSize: { width: undefined, height: undefined },
    onFlip: jest.fn(),
    crop: false,
    env: {},
    getConfigValue: jest.fn(),
    transformImage: false,
  });

  it("defaults to index 0 and flips up", () => {
    const p = fakeProps();
    const flipper = shallow<ImageFlipper>(<ImageFlipper {...p} />);
    const up = flipper.instance().go(1);
    up();
    expect(p.onFlip).toHaveBeenCalledWith(p.images[1].uuid);
  });

  it("flips down", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const flipper = shallow<ImageFlipper>(<ImageFlipper {...p} />);
    const down = flipper.instance().go(-1);
    down();
    expect(p.onFlip).toHaveBeenCalledWith(p.images[0].uuid);
  });

  it("stops at upper end", () => {
    const p = fakeProps();
    p.currentImage = p.images[2];
    const flipper = shallow<ImageFlipper>(<ImageFlipper {...p} />);
    const up = flipper.instance().go(1);
    up();
    expect(p.onFlip).not.toHaveBeenCalled();
  });

  it("stops at lower end", () => {
    const p = fakeProps();
    p.currentImage = p.images[0];
    const flipper = shallow<ImageFlipper>(<ImageFlipper {...p} />);
    const down = flipper.instance().go(-1);
    down();
    expect(p.onFlip).not.toHaveBeenCalled();
  });

  it("disables flippers when no images", () => {
    const p = fakeProps();
    p.images = prepareImages([]);
    const wrapper = shallow(<ImageFlipper {...p} />);
    expect(wrapper.find("button").first().props().disabled).toBeTruthy();
    expect(wrapper.find("button").last().props().disabled).toBeTruthy();
  });

  it("disables flippers when only one image", () => {
    const p = fakeProps();
    p.images = prepareImages([fakeImages[0]]);
    const wrapper = shallow(<ImageFlipper {...p} />);
    expect(wrapper.find("button").first().props().disabled).toBeTruthy();
    expect(wrapper.find("button").last().props().disabled).toBeTruthy();
  });

  it("disables next flipper on load", () => {
    const wrapper = shallow(<ImageFlipper {...fakeProps()} />);
    wrapper.update();
    expect(wrapper.find("button").first().props().disabled).toBeFalsy();
    expect(wrapper.find("button").last().props().disabled).toBeTruthy();
  });

  it("disables flipper at lower end", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const wrapper = shallow(<ImageFlipper {...p} />);
    wrapper.setState({ disableNext: false });
    const nextButton = wrapper.render().find("button").last();
    expect(nextButton.text().toLowerCase()).toBe("next");
    expect(nextButton.prop("disabled")).toBeFalsy();
    wrapper.find("button").last().simulate("click");
    expect(p.onFlip).toHaveBeenLastCalledWith(p.images[0].uuid);
    expect(wrapper.find("button").last().render().prop("disabled")).toBeTruthy();
  });

  it("disables flipper at upper end", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const wrapper = mount(<ImageFlipper {...p} />);
    const prevButton = wrapper.find("button").first();
    expect(prevButton.text().toLowerCase()).toBe("prev");
    expect(prevButton.props().disabled).toBeFalsy();
    prevButton.simulate("click");
    expect(p.onFlip).toHaveBeenCalledWith(p.images[2].uuid);
    jest.resetAllMocks();
    wrapper.update();
    const updatedPrevButton = wrapper.find("button").first();
    expect(updatedPrevButton.props().disabled).toBeTruthy();
    updatedPrevButton.simulate("click");
    expect(p.onFlip).not.toHaveBeenCalled();
  });

  it("renders placeholder", () => {
    const p = fakeProps();
    p.images = [];
    const wrapper = mount(<ImageFlipper {...p} />);
    expect(wrapper.find("img").last().props().src).toEqual(PLACEHOLDER_FARMBOT);
  });

  it("calls back on transformed image load", () => {
    const p = fakeProps();
    const wrapper = shallow<ImageFlipper>(<ImageFlipper {...p} />);
    const fakeImg = new Image();
    Object.defineProperty(fakeImg, "naturalWidth", {
      value: 10, configurable: true,
    });
    Object.defineProperty(fakeImg, "naturalHeight", {
      value: 20, configurable: true,
    });
    wrapper.instance().onImageLoad(fakeImg);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_IMAGE_SIZE,
      payload: { width: 10, height: 20 },
    });
  });
});
