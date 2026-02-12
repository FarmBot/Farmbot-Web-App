import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  ImageFlipper, PLACEHOLDER_FARMBOT, PLACEHOLDER_FARMBOT_DARK,
} from "../image_flipper";
import { fakeImages } from "../../../__test_support__/fake_state/images";
import { TaggedImage } from "farmbot";
import { defensiveClone } from "../../../util";
import { ImageFlipperProps } from "../interfaces";
import { Actions } from "../../../constants";
import { UUID } from "../../../resources/interfaces";
import * as imageActions from "../actions";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";

jest.mock("../flipper_image", () => ({
  FlipperImage: () => <div className={"flipper-image-mock"} />,
}));

let selectImageSpy: jest.SpyInstance;
let setShownMapImagesSpy: jest.SpyInstance;

beforeEach(() => {
  selectImageSpy = jest.spyOn(imageActions, "selectImage")
    .mockImplementation((uuid: UUID | undefined) =>
      ({ type: "SELECT_IMAGE", payload: uuid }) as never);
  setShownMapImagesSpy = jest.spyOn(imageActions, "setShownMapImages")
    .mockImplementation((uuid: UUID | undefined) =>
      ({ type: "SET_SHOWN_MAP_IMAGES", payload: uuid ? [1] : [] }) as never);
});

afterEach(() => {
  selectImageSpy.mockRestore();
  setShownMapImagesSpy.mockRestore();
});

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
    expect(imageActions.selectImage).toHaveBeenCalledWith(uuid);
    expect(imageActions.setShownMapImages).toHaveBeenCalledWith(uuid);
  };

  const expectNoFlip = () => {
    expect(imageActions.selectImage).not.toHaveBeenCalled();
    expect(imageActions.setShownMapImages).not.toHaveBeenCalled();
  };

  it("defaults to index 0 and flips up", () => {
    const p = fakeProps();
    new ImageFlipper(p).go(1)();
    expectFlip(p.images[1].uuid);
  });

  it("flips down", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    new ImageFlipper(p).go(-1)();
    expectFlip(p.images[0].uuid);
  });

  it("flips down: alternative action", () => {
    const p = fakeProps();
    p.flipActionOverride = jest.fn();
    p.currentImage = p.images[1];
    new ImageFlipper(p).go(-1)();
    expect(p.flipActionOverride).toHaveBeenCalledWith(0);
  });

  it("flips down: arrow key", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const { container } = render(<ImageFlipper {...p} />);
    fireEvent.keyDown(container.querySelector(".image-flipper") as HTMLElement,
      { key: "ArrowRight" });
    expectFlip(p.images[0].uuid);
  });

  it("flips up: arrow key", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const { container } = render(<ImageFlipper {...p} />);
    fireEvent.keyDown(container.querySelector(".image-flipper") as HTMLElement,
      { key: "ArrowLeft" });
    expectFlip(p.images[2].uuid);
  });

  it("stops at upper end", () => {
    const p = fakeProps();
    p.currentImage = p.images[2];
    new ImageFlipper(p).go(1)();
    expectNoFlip();
  });

  it("stops at lower end", () => {
    const p = fakeProps();
    p.currentImage = p.images[0];
    new ImageFlipper(p).go(-1)();
    expectNoFlip();
  });

  it("hides flippers when no images", () => {
    const p = fakeProps();
    p.images = prepareImages([]);
    const { container } = render(<ImageFlipper {...p} />);
    expect(container.querySelectorAll("button").length).toEqual(0);
  });

  it("hides flippers when only one image", () => {
    const p = fakeProps();
    p.images = prepareImages([fakeImages[0]]);
    const { container } = render(<ImageFlipper {...p} />);
    expect(container.querySelectorAll("button").length).toEqual(0);
  });

  it("hides next flipper on load", () => {
    const { container } = render(<ImageFlipper {...fakeProps()} />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toEqual(1);
    expect(buttons.item(0)?.className).toContain("image-flipper-left");
  });

  it("hides flipper at ends", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const { container } = render(<ImageFlipper {...p} />);
    const startButtons = container.querySelectorAll("button");
    expect(startButtons.length).toEqual(1);
    expect(startButtons.item(0)?.className).toContain("left");
    fireEvent.click(screen.getByTitle(/previous image/i));
    expectFlip(p.images[2].uuid);
    const endButtons = container.querySelectorAll("button");
    expect(endButtons.length).toEqual(1);
    expect(endButtons.item(0)?.className).toContain("right");
  });

  it("renders placeholder", () => {
    const p = fakeProps();
    p.images = [];
    const { container } = render(<ImageFlipper {...p} />);
    expect(container.querySelector("img")?.getAttribute("src"))
      .toEqual(PLACEHOLDER_FARMBOT);
  });

  it("renders dark placeholder", () => {
    const p = fakeProps();
    p.images = [];
    p.id = "fullscreen-flipper";
    const { container } = render(<ImageFlipper {...p} />);
    expect(container.querySelector("img")?.getAttribute("src"))
      .toEqual(PLACEHOLDER_FARMBOT_DARK);
  });

  it("calls back on transformed image load", () => {
    const p = fakeProps();
    const instance = new ImageFlipper(p);
    const fakeImg = new Image();
    Object.defineProperty(fakeImg, "naturalWidth", {
      value: 10, configurable: true,
    });
    Object.defineProperty(fakeImg, "naturalHeight", {
      value: 20, configurable: true,
    });
    instance.onImageLoad(fakeImg);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_IMAGE_SIZE,
      payload: { width: 10, height: 20 },
    });
  });
});
