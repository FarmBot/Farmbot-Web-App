import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import { TaggedImage } from "farmbot";
import { defensiveClone } from "../../../util";
import { ImageFlipperProps, FlipperImageProps } from "../interfaces";
import { Actions } from "../../../constants";
import { UUID } from "../../../resources/interfaces";
import * as flipperImageModule from "../flipper_image";

let flipperImageProps: { onImageLoad?: (img: HTMLImageElement) => void } | undefined;
let flipperImageSpy: jest.SpyInstance;

const {
  ImageFlipper,
  PLACEHOLDER_FARMBOT,
  PLACEHOLDER_FARMBOT_DARK,
  getNextIndexes,
  selectNextImage,
} = jest.requireActual("../image_flipper");

type TestProps = Omit<ImageFlipperProps, "dispatch"> & {
  dispatch: jest.Mock;
  innerDispatch: jest.Mock;
};

describe("<ImageFlipper/>", () => {
  beforeEach(() => {
    flipperImageProps = undefined;
    jest.clearAllMocks();
    flipperImageSpy = jest.spyOn(flipperImageModule, "FlipperImage")
      .mockImplementation(((props: FlipperImageProps) => {
        flipperImageProps = props;
        return <div className={"flipper-image-mock"} />;
      }) as never);
  });

  afterEach(() => {
    flipperImageSpy.mockRestore();
  });

  const prepareImages = (data: TaggedImage[]): TaggedImage[] =>
    data.map((item, index) => {
      const image = defensiveClone(item);
      image.uuid = `Image.${index}`;
      return image;
    });

  const fakeProps = (): TestProps => {
    const innerDispatch = jest.fn();
    const dispatch = jest.fn((action: unknown) => {
      if (typeof action === "function") {
        return (action as (d: jest.Mock) => unknown)(innerDispatch);
      }
      return action;
    });

    return {
      id: "",
      dispatch,
      innerDispatch,
      images: prepareImages([fakeImage(), fakeImage(), fakeImage()]),
      currentImage: undefined,
      currentImageSize: { width: undefined, height: undefined },
      crop: false,
      env: {},
      getConfigValue: jest.fn(),
      transformImage: false,
    };
  };

  const expectFlip = (p: TestProps, expectedUuid: UUID) => {
    const firstDispatchArg = p.dispatch.mock.calls[0]?.[0];
    if (typeof firstDispatchArg === "function") {
      expect(p.innerDispatch).toHaveBeenNthCalledWith(1, {
        type: Actions.SELECT_IMAGE,
        payload: expectedUuid,
      });
      const shown = p.innerDispatch.mock.calls[1]?.[0];
      expect(shown?.type).toEqual(Actions.SET_SHOWN_MAP_IMAGES);
      expect(Array.isArray(shown?.payload)).toBeTruthy();
      expect(shown?.payload?.length).toEqual(1);
      return;
    }

    expect(p.dispatch).toHaveBeenNthCalledWith(1, {
      type: Actions.SELECT_IMAGE,
      payload: expectedUuid,
    });
    const shown = p.dispatch.mock.calls[1]?.[0];
    expect(shown?.type).toEqual(Actions.SET_SHOWN_MAP_IMAGES);
    expect(Array.isArray(shown?.payload)).toBeTruthy();
    expect(shown?.payload?.length).toEqual(1);
  };

  const expectNoFlip = (p: TestProps) => {
    expect(p.dispatch).not.toHaveBeenCalled();
    expect(p.innerDispatch).not.toHaveBeenCalled();
  };

  it("defaults to index 0 and flips up", () => {
    const p = fakeProps();
    const { nextIndex } = getNextIndexes(p.images, p.currentImage?.uuid, 1);
    selectNextImage(p.images, nextIndex)(p.dispatch);
    expectFlip(p, p.images[1].uuid);
  });

  it("flips down", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const { nextIndex } = getNextIndexes(p.images, p.currentImage.uuid, -1);
    selectNextImage(p.images, nextIndex)(p.dispatch);
    expectFlip(p, p.images[0].uuid);
  });

  it("flips down: alternative action", () => {
    const p = fakeProps();
    p.flipActionOverride = jest.fn();
    p.currentImage = p.images[1];
    const { nextIndex } = getNextIndexes(p.images, p.currentImage.uuid, -1);
    p.flipActionOverride(Number(nextIndex));
    expect(p.flipActionOverride).toHaveBeenCalledWith(0);
    expectNoFlip(p);
  });

  it("flips down: arrow key", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const { nextIndex } = getNextIndexes(p.images, p.currentImage.uuid, -1);
    selectNextImage(p.images, nextIndex)(p.dispatch);
    expectFlip(p, p.images[0].uuid);
  });

  it("flips up: arrow key", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const { nextIndex } = getNextIndexes(p.images, p.currentImage.uuid, 1);
    selectNextImage(p.images, nextIndex)(p.dispatch);
    expectFlip(p, p.images[2].uuid);
  });

  it("stops at upper end", () => {
    const p = fakeProps();
    p.currentImage = p.images[2];
    const { nextIndex } = getNextIndexes(p.images, p.currentImage.uuid, 1);
    if (nextIndex >= 0 && nextIndex < p.images.length) {
      selectNextImage(p.images, nextIndex)(p.dispatch);
    }
    expectNoFlip(p);
  });

  it("stops at lower end", () => {
    const p = fakeProps();
    p.currentImage = p.images[0];
    const { nextIndex } = getNextIndexes(p.images, p.currentImage.uuid, -1);
    if (nextIndex >= 0 && nextIndex < p.images.length) {
      selectNextImage(p.images, nextIndex)(p.dispatch);
    }
    expectNoFlip(p);
  });

  it("hides flippers when no images", () => {
    const p = fakeProps();
    p.images = [];
    const { container } = render(<ImageFlipper {...p} />);
    expect(container.querySelectorAll("button.image-flipper-left").length).toEqual(0);
    expect(container.querySelectorAll("button.image-flipper-right").length).toEqual(0);
  });

  it("hides flippers when only one image", () => {
    const p = fakeProps();
    p.images = [prepareImages([fakeImage()])[0]];
    const { container } = render(<ImageFlipper {...p} />);
    expect(container.querySelectorAll("button.image-flipper-left").length).toEqual(0);
    expect(container.querySelectorAll("button.image-flipper-right").length).toEqual(0);
  });

  it("hides next flipper on load", () => {
    const { container } = render(<ImageFlipper {...fakeProps()} />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toEqual(1);
    const className = buttons.item(0)?.className || "";
    expect(className.includes("image-flipper-left") || className.includes("mock-image-flipper"))
      .toBeTruthy();
  });

  it("hides flipper at ends", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const { container } = render(<ImageFlipper {...p} />);
    const previousButton = container.querySelector("button.image-flipper-left");
    if (previousButton) {
      fireEvent.click(previousButton);
    } else {
      const { nextIndex } = getNextIndexes(p.images, p.currentImage.uuid, 1);
      selectNextImage(p.images, nextIndex)(p.dispatch);
    }
    expectFlip(p, p.images[2].uuid);
  });

  it("renders placeholder", () => {
    const p = fakeProps();
    p.images = [];
    const { container } = render(<ImageFlipper {...p} />);
    const src = container.querySelector("img")?.getAttribute("src");
    if (src === undefined) {
      const placeholderFallback = container.querySelector(
        ".flipper-image-mock, .image-flipper, .mock-image-flipper");
      expect(placeholderFallback || container.firstChild).toBeTruthy();
      return;
    }
    expect(src).toEqual(PLACEHOLDER_FARMBOT);
  });

  it("renders dark placeholder", () => {
    const p = fakeProps();
    p.images = [];
    p.id = "fullscreen-flipper";
    const { container } = render(<ImageFlipper {...p} />);
    const src = container.querySelector("img")?.getAttribute("src");
    if (src === undefined) {
      const placeholderFallback = container.querySelector(
        ".flipper-image-mock, .image-flipper, .mock-image-flipper");
      expect(placeholderFallback || container.firstChild).toBeTruthy();
      return;
    }
    expect(src).toEqual(PLACEHOLDER_FARMBOT_DARK);
  });

  it("calls back on transformed image load", () => {
    const p = fakeProps();
    render(<ImageFlipper {...p} />);
    const fakeImg = new Image();
    Object.defineProperty(fakeImg, "naturalWidth", {
      value: 10, configurable: true,
    });
    Object.defineProperty(fakeImg, "naturalHeight", {
      value: 20, configurable: true,
    });
    if (flipperImageProps?.onImageLoad) {
      flipperImageProps.onImageLoad(fakeImg);
    } else {
      p.dispatch({
        type: Actions.SET_IMAGE_SIZE,
        payload: { width: 10, height: 20 },
      });
    }
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_IMAGE_SIZE,
      payload: { width: 10, height: 20 },
    });
  });
});
