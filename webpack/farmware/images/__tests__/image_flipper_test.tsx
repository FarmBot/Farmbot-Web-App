import "../../../unmock_i18next";
import * as React from "react";
import { mount } from "enzyme";
import { ImageFlipper } from "../image_flipper";
import { fakeImages } from "../../../__test_support__/fake_state/images";
import { TaggedImage } from "../../../resources/tagged_resources";
import { defensiveClone } from "../../../util";

describe("<ImageFlipper/>", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function prepareImages(data: TaggedImage[]): TaggedImage[] {
    const images: TaggedImage[] = [];
    data.forEach((item, index) => {
      const image = defensiveClone(item);
      image.uuid = `Position ${index}`;
      images.push(image);
    });
    return images;
  }

  it("defaults to index 0 and flips up", () => {
    const onFlip = jest.fn();
    const x = new ImageFlipper();
    const currentImage = undefined;
    const images = prepareImages(fakeImages);
    x.props = { images, currentImage, onFlip };
    const up = x.go(1);
    up();
    expect(onFlip).toHaveBeenCalledWith(images[1].uuid);
  });

  it("flips down", () => {
    const onFlip = jest.fn();
    const x = new ImageFlipper();
    const images = prepareImages(fakeImages);
    const currentImage = images[1];
    x.props = { images, currentImage, onFlip };
    const down = x.go(-1);
    down();
    expect(onFlip).toHaveBeenCalledWith(images[0].uuid);
  });

  it("stops at upper end", () => {
    const onFlip = jest.fn();
    const x = new ImageFlipper();
    const images = prepareImages(fakeImages);
    const currentImage = images[2];
    x.props = { images, currentImage, onFlip };
    const up = x.go(1);
    up();
    expect(onFlip).not.toHaveBeenCalled();
  });

  it("stops at lower end", () => {
    const onFlip = jest.fn();
    const x = new ImageFlipper();
    const images = prepareImages(fakeImages);
    const currentImage = images[0];
    x.props = { images, currentImage, onFlip };
    const down = x.go(-1);
    down();
    expect(onFlip).not.toHaveBeenCalled();
  });

  it("disables flippers when no images", () => {
    const onFlip = jest.fn();
    const images = prepareImages([]);
    const currentImage = undefined;
    const props = { images, currentImage, onFlip };
    const wrapper = mount(<ImageFlipper {...props} />);
    expect(wrapper.find("button").first().props().disabled).toBeTruthy();
    expect(wrapper.find("button").last().props().disabled).toBeTruthy();
  });

  it("disables flippers when only one image", () => {
    const onFlip = jest.fn();
    const images = prepareImages([fakeImages[0]]);
    const currentImage = undefined;
    const props = { images, currentImage, onFlip };
    const wrapper = mount(<ImageFlipper {...props} />);
    expect(wrapper.find("button").first().props().disabled).toBeTruthy();
    expect(wrapper.find("button").last().props().disabled).toBeTruthy();
  });

  it("disables next flipper on load", () => {
    const onFlip = jest.fn();
    const images = prepareImages(fakeImages);
    const currentImage = undefined;
    const props = { images, currentImage, onFlip };
    const wrapper = mount(<ImageFlipper {...props} />);
    expect(wrapper.find("button").first().props().disabled).toBeFalsy();
    expect(wrapper.find("button").last().props().disabled).toBeTruthy();
  });

  it("disables flipper at lower end", () => {
    const onFlip = jest.fn();
    const images = prepareImages(fakeImages);
    const currentImage = images[1];
    const props = { images, currentImage, onFlip };
    const wrapper = mount(<ImageFlipper {...props} />);
    wrapper.setState({ disableNext: false });
    const nextButton = wrapper.find("button").last();
    expect(nextButton.text().toLowerCase()).toBe("next");
    expect(nextButton.props().disabled).toBeFalsy();
    nextButton.simulate("click");
    expect(onFlip).toHaveBeenLastCalledWith(images[0].uuid);
    expect(nextButton.props().disabled).toBeTruthy();
    nextButton.simulate("click");
    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it("disables flipper at upper end", () => {
    const onFlip = jest.fn();
    const images = prepareImages(fakeImages);
    const currentImage = images[1];
    const props = { images, currentImage, onFlip };
    const wrapper = mount(<ImageFlipper {...props} />);
    const prevButton = wrapper.find("button").first();
    expect(prevButton.text().toLowerCase()).toBe("prev");
    expect(prevButton.props().disabled).toBeFalsy();
    prevButton.simulate("click");
    expect(onFlip).toHaveBeenCalledWith(images[2].uuid);
    expect(prevButton.props().disabled).toBeTruthy();
    prevButton.simulate("click");
    expect(onFlip).toHaveBeenCalledTimes(1);
  });

});
