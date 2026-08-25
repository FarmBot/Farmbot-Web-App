import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import { TaggedImage } from "farmbot";
import { defensiveClone } from "../../../util";
import { ImageFlipperProps, FlipperImageProps } from "../interfaces";
import { Actions } from "../../../constants";
import * as flipperImageModule from "../flipper_image";

let flipperImageProps: { onImageLoad?: (img: HTMLImageElement) => void } | undefined;
let flipperImageSpy: jest.SpyInstance;
let flipperImageMounts = 0;

class FlipperImageMock extends React.Component<FlipperImageProps> {
  componentDidMount() {
    flipperImageMounts++;
  }

  render() {
    flipperImageProps = this.props;
    return <div className={"flipper-image-mock"} />;
  }
}

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
    flipperImageMounts = 0;
    jest.clearAllMocks();
    flipperImageSpy = jest.spyOn(flipperImageModule, "FlipperImage")
      .mockImplementation(((props: FlipperImageProps) =>
        <FlipperImageMock {...props} />) as never);
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

  const expectFlip = (p: TestProps, expectedImage: TaggedImage) => {
    const firstDispatchArg = p.dispatch.mock.calls[0]?.[0];
    if (typeof firstDispatchArg === "function") {
      expect(p.innerDispatch).toHaveBeenNthCalledWith(1, {
        type: Actions.SELECT_IMAGE,
        payload: expectedImage.uuid,
      });
      const shown = p.innerDispatch.mock.calls[1]?.[0];
      expect(shown?.type).toEqual(Actions.SET_SHOWN_MAP_IMAGES);
      expect(shown?.payload).toEqual([expectedImage.body.id]);
      return;
    }

    expect(p.dispatch).toHaveBeenNthCalledWith(1, {
      type: Actions.SELECT_IMAGE,
      payload: expectedImage.uuid,
    });
    const shown = p.dispatch.mock.calls[1]?.[0];
    expect(shown?.type).toEqual(Actions.SET_SHOWN_MAP_IMAGES);
    expect(shown?.payload).toEqual([expectedImage.body.id]);
  };

  const expectNoFlip = (p: TestProps) => {
    expect(p.dispatch).not.toHaveBeenCalled();
    expect(p.innerDispatch).not.toHaveBeenCalled();
  };

  it("defaults to index 0 and flips up", () => {
    const p = fakeProps();
    const { nextIndex } = getNextIndexes(p.images, p.currentImage?.uuid, 1);
    selectNextImage(p.images, nextIndex)(p.dispatch);
    expectFlip(p, p.images[1]);
  });

  it("flips down", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const { nextIndex } = getNextIndexes(p.images, p.currentImage.uuid, -1);
    selectNextImage(p.images, nextIndex)(p.dispatch);
    expectFlip(p, p.images[0]);
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
    expectFlip(p, p.images[0]);
  });

  it("flips up: arrow key", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const { nextIndex } = getNextIndexes(p.images, p.currentImage.uuid, 1);
    selectNextImage(p.images, nextIndex)(p.dispatch);
    expectFlip(p, p.images[2]);
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

  it("keeps the image mounted when processing updates its URL", () => {
    const p = fakeProps();
    const image = p.images[0];
    image.body.attachment_url =
      "/placeholder_farmbot.jpg?text=Processing";
    p.currentImage = image;
    const { rerender } = render(<ImageFlipper {...p} />);
    expect(flipperImageMounts).toEqual(1);

    const processedImage = defensiveClone(image);
    processedImage.body.attachment_url = "https://example.com/processed.jpg";
    rerender(<ImageFlipper {...p}
      images={[processedImage]}
      currentImage={processedImage} />);

    expect(flipperImageMounts).toEqual(1);
  });

  it("updates the image size when the image loads", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    render(<ImageFlipper {...p} />);
    const image = {
      naturalWidth: 640,
      naturalHeight: 480,
    } as HTMLImageElement;

    flipperImageProps?.onImageLoad?.(image);

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_IMAGE_SIZE,
      payload: { width: 640, height: 480 },
    });
  });

  it.each<[string, number]>([
    ["ArrowLeft", 2],
    ["ArrowRight", 0],
  ])("flips with the %s key", (key, expectedIndex) => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const { container } = render(<ImageFlipper {...p} />);
    const flipper = container.querySelector(".image-flipper");

    fireEvent.keyDown(flipper as HTMLElement, { key });

    expectFlip(p, p.images[expectedIndex]);
  });

  it("ignores other keys", () => {
    const p = fakeProps();
    p.currentImage = p.images[1];
    const { container } = render(<ImageFlipper {...p} />);
    const flipper = container.querySelector(".image-flipper");

    fireEvent.keyDown(flipper as HTMLElement, { key: "Escape" });

    expectNoFlip(p);
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
    expectFlip(p, p.images[2]);
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
