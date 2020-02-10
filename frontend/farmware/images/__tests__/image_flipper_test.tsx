import * as React from "react";
import { shallow, mount } from "enzyme";
import { ImageFlipper, PLACEHOLDER_FARMBOT } from "../image_flipper";
import { fakeImages } from "../../../__test_support__/fake_state/images";
import { TaggedImage } from "farmbot";
import { defensiveClone } from "../../../util";
import { ImageFlipperProps } from "../interfaces";

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
    images: prepareImages(fakeImages),
    currentImage: undefined,
    onFlip: jest.fn(),
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
    wrapper.update();
    // FAILED
    expect(p.onFlip).toHaveBeenCalledWith(p.images[2].uuid);
    expect(wrapper.find("button").first().render().prop("disabled")).toBeTruthy();
    prevButton.simulate("click");
    expect(p.onFlip).toHaveBeenCalledTimes(1);
  });

  it("renders placeholder", () => {
    const p = fakeProps();
    p.images[0].body.attachment_processed_at = undefined;
    p.currentImage = p.images[0];
    const wrapper = mount(<ImageFlipper {...p} />);
    expect(wrapper.find("img").last().props().src).toEqual(PLACEHOLDER_FARMBOT);
  });

  it("knows when image is loaded", () => {
    const wrapper = mount<ImageFlipper>(<ImageFlipper {...fakeProps()} />);
    const image = shallow(wrapper.instance().imageJSX());
    expect(wrapper.state().isLoaded).toEqual(false);
    image.find("img").simulate("load");
    expect(wrapper.state().isLoaded).toEqual(true);
  });
});
