jest.mock("../actions", () => ({
  selectImage: jest.fn(),
  setShownMapImages: jest.fn(),
}));

import React from "react";
import { shallow, mount } from "enzyme";
import {
  ImageFlipper, PLACEHOLDER_FARMBOT, PLACEHOLDER_FARMBOT_DARK,
} from "../image_flipper";
import { fakeImages } from "../../../__test_support__/fake_state/images";
import { TaggedImage } from "farmbot";
import { defensiveClone } from "../../../util";
import { ImageFlipperProps } from "../interfaces";
import { Actions } from "../../../constants";
import { UUID } from "../../../resources/interfaces";
import { selectImage, setShownMapImages } from "../actions";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";

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
    id: "",
    dispatch: mockDispatch(),
    images: prepareImages(fakeImages),
    currentImage: undefined,
    currentImageSize: { width: undefined, height: undefined },
    crop: false,
    env: {},
    getConfigValue: jest.fn(),
    transformImage: false,
  });

  const expectFlip = (uuid: UUID) => {
    expect(selectImage).toHaveBeenCalledWith(uuid);
    expect(setShownMapImages).toHaveBeenCalledWith(uuid);
  };

  const expectNoFlip = () => {
    expect(selectImage).not.toHaveBeenCalled();
    expect(setShownMapImages).not.toHaveBeenCalled();
  };

  it("defaults to index 0 and flips up", () => {
    const p = fakeProps();
    const flipper = shallow<ImageFlipper>(<ImageFlipper {...p} />);
    const up = flipper.instance().go(1);
    up();
    expectFlip(p.images[1].uuid);
  });

  it("flips down", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const flipper = shallow<ImageFlipper>(<ImageFlipper {...p} />);
    const down = flipper.instance().go(-1);
    down();
    expectFlip(p.images[0].uuid);
  });

  it("flips down: alternative action", () => {
    const p = fakeProps();
    p.flipActionOverride = jest.fn();
    p.currentImage = p.images[1];
    const flipper = shallow<ImageFlipper>(<ImageFlipper {...p} />);
    const down = flipper.instance().go(-1);
    down();
    expect(p.flipActionOverride).toHaveBeenCalledWith(0);
  });

  it("flips down: arrow key", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const flipper = shallow<ImageFlipper>(<ImageFlipper {...p} />);
    flipper.find(".image-flipper").first().simulate("keydown",
      { key: "ArrowRight" });
    expectFlip(p.images[0].uuid);
  });

  it("flips up: arrow key", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const flipper = shallow<ImageFlipper>(<ImageFlipper {...p} />);
    flipper.find(".image-flipper").first().simulate("keydown",
      { key: "ArrowLeft" });
    expectFlip(p.images[2].uuid);
  });

  it("stops at upper end", () => {
    const p = fakeProps();
    p.currentImage = p.images[2];
    const flipper = shallow<ImageFlipper>(<ImageFlipper {...p} />);
    const up = flipper.instance().go(1);
    up();
    expectNoFlip();
  });

  it("stops at lower end", () => {
    const p = fakeProps();
    p.currentImage = p.images[0];
    const flipper = shallow<ImageFlipper>(<ImageFlipper {...p} />);
    const down = flipper.instance().go(-1);
    down();
    expectNoFlip();
  });

  it("hides flippers when no images", () => {
    const p = fakeProps();
    p.images = prepareImages([]);
    const wrapper = shallow(<ImageFlipper {...p} />);
    expect(wrapper.find("button").length).toEqual(0);
  });

  it("hides flippers when only one image", () => {
    const p = fakeProps();
    p.images = prepareImages([fakeImages[0]]);
    const wrapper = shallow(<ImageFlipper {...p} />);
    expect(wrapper.find("button").length).toEqual(0);
  });

  it("hides next flipper on load", () => {
    const wrapper = shallow(<ImageFlipper {...fakeProps()} />);
    wrapper.update();
    const buttons = wrapper.find("button");
    expect(buttons.length).toEqual(1);
    expect(buttons.first().hasClass("image-flipper-left")).toBeTruthy();
  });

  it("hides flipper at ends", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const wrapper = shallow(<ImageFlipper {...p} />);
    const buttons = wrapper.render().find("button");
    expect(buttons.html()).toContain("left");
    expect(buttons.length).toEqual(1);
    wrapper.find("button").first().simulate("click");
    expectFlip(p.images[2].uuid);
    wrapper.update();
    const btns = wrapper.render().find("button");
    expect(btns.html()).toContain("right");
    expect(btns.length).toEqual(1);
  });

  it("renders placeholder", () => {
    const p = fakeProps();
    p.images = [];
    const wrapper = mount(<ImageFlipper {...p} />);
    expect(wrapper.find("img").last().props().src).toEqual(PLACEHOLDER_FARMBOT);
  });

  it("renders dark placeholder", () => {
    const p = fakeProps();
    p.images = [];
    p.id = "fullscreen-flipper";
    const wrapper = mount(<ImageFlipper {...p} />);
    expect(wrapper.find("img").last().props().src)
      .toEqual(PLACEHOLDER_FARMBOT_DARK);
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
