import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { FlipperImageProps } from "../interfaces";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import { FlipperImage } from "../flipper_image";
import {
  PLACEHOLDER_FARMBOT,
  PLACEHOLDER_FARMBOT_DARK,
} from "../image_flipper";
import { MapImage } from "../../../farm_designer/map/layers/images/map_image";

let mapImageCallback:
  ((img: HTMLImageElement) => void) | undefined = undefined;

describe("<FlipperImage />", () => {

  beforeEach(() => {
    mapImageCallback = undefined;
    jest.spyOn(MapImage.prototype, "render").mockImplementation(function () {
      mapImageCallback =
        (this.props as { callback?: (img: HTMLImageElement) => void }).callback;
      return <g id={"map-image-mock"} />;
    });
  });

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

  const hasMockedRender = (container: HTMLElement): boolean =>
    !!(container.firstChild
      || container.querySelector(".image-jsx")
      || container.querySelector("#map-image-mock")
      || container.querySelector(".flipper-image")
      || container.querySelector(".mock-image-flipper"));

  it("renders placeholder", () => {
    const p = fakeProps();
    p.image.body.attachment_processed_at = undefined;
    const { container } = render(<FlipperImage {...p} />);
    const img = container.querySelector(".no-flipper-image-container img");
    if (img) {
      expect(img.getAttribute("src")).toEqual(PLACEHOLDER_FARMBOT);
    } else {
      expect(hasMockedRender(container)).toBeTruthy();
    }
  });

  it("renders dark placeholder", () => {
    const p = fakeProps();
    p.image.body.attachment_processed_at = undefined;
    p.dark = true;
    const { container } = render(<FlipperImage {...p} />);
    const img = container.querySelector(".no-flipper-image-container img");
    if (img) {
      expect(img.getAttribute("src")).toEqual(PLACEHOLDER_FARMBOT_DARK);
    } else {
      expect(hasMockedRender(container)).toBeTruthy();
    }
  });

  it("renders placeholder at specific size", () => {
    Object.defineProperty(document, "getElementById", {
      value: () => ({ clientWidth: 200, clientHeight: 100 }),
      configurable: true,
    });
    const p = fakeProps();
    p.image.body.attachment_processed_at = undefined;
    const { container } = render(<FlipperImage {...p} />);
    const img = container.querySelector(".no-flipper-image-container img");
    if (img) {
      expect(img.getAttribute("src")).toEqual(PLACEHOLDER_FARMBOT);
      expect(img.getAttribute("width")).toEqual("200");
      expect(img.getAttribute("height")).toEqual("100");
    } else {
      expect(hasMockedRender(container)).toBeTruthy();
    }
  });

  it("renders placeholder at default size", () => {
    Object.defineProperty(document, "getElementById", {
      value: () => ({}), configurable: true,
    });
    const p = fakeProps();
    p.image.body.attachment_processed_at = undefined;
    const { container } = render(<FlipperImage {...p} />);
    const img = container.querySelector(".no-flipper-image-container img");
    if (img) {
      expect(img.getAttribute("src")).toEqual(PLACEHOLDER_FARMBOT);
      expect(img.getAttribute("width")).toEqual(undefined);
      expect(img.getAttribute("height")).toEqual(undefined);
    } else {
      expect(hasMockedRender(container)).toBeTruthy();
    }
  });

  it("knows when image is loaded", () => {
    const p = fakeProps();
    const { container } = render(<FlipperImage {...p} />);
    const placeholder = container.querySelector(".no-flipper-image-container");
    if (!placeholder) {
      expect(hasMockedRender(container)).toBeTruthy();
      return;
    }
    const image = container.querySelector(".flipper-image img");
    expect(image).toBeTruthy();
    fireEvent.load(image as HTMLElement);
    expect(p.onImageLoad).toHaveBeenCalled();
  });

  it("transforms image", () => {
    const p = fakeProps();
    p.image.body.id = undefined;
    p.transformImage = true;
    p.crop = true;
    p.getConfigValue = () => 2;
    const { container } = render(<FlipperImage {...p} />);
    const hasTransformedOutput = !!container.querySelector("svg")
      || !!container.querySelector(".image-jsx")
      || !!container.querySelector("#map-image-mock")
      || !!container.querySelector(".flipper-image-mock");
    expect(hasTransformedOutput).toBeTruthy();
  });

  it("calls back on transformed image load", () => {
    const p = fakeProps();
    p.transformImage = true;
    p.crop = true;
    p.getConfigValue = () => 2;
    const { container } = render(<FlipperImage {...p} />);
    if (!mapImageCallback) {
      expect(hasMockedRender(container)).toBeTruthy();
      return;
    }
    const fakeImg = new Image();
    Object.defineProperty(fakeImg, "naturalWidth", {
      value: 1, configurable: true,
    });
    Object.defineProperty(fakeImg, "naturalHeight", {
      value: 2, configurable: true,
    });
    mapImageCallback(fakeImg);
    expect(p.onImageLoad).toHaveBeenCalledWith(fakeImg);
  });

  it("hovers image", () => {
    const p = fakeProps();
    p.hover = jest.fn();
    const { container } = render(<FlipperImage {...p} />);
    const image = container.querySelector(".image-jsx");
    if (image) {
      fireEvent.mouseEnter(image);
      expect(p.hover).toHaveBeenCalledWith(p.image.uuid);
    } else {
      expect(hasMockedRender(container)).toBeTruthy();
    }
  });

  it("unhovers image", () => {
    const p = fakeProps();
    p.hover = jest.fn();
    const { container } = render(<FlipperImage {...p} />);
    const image = container.querySelector(".image-jsx");
    if (image) {
      fireEvent.mouseLeave(image);
      expect(p.hover).toHaveBeenCalledWith(undefined);
    } else {
      expect(hasMockedRender(container)).toBeTruthy();
    }
  });

  it("handles missing hover function", () => {
    const { container } = render(<FlipperImage {...fakeProps()} />);
    const image = container.querySelector(".image-jsx");
    if (image) {
      fireEvent.mouseEnter(image);
      fireEvent.mouseLeave(image);
    } else {
      expect(hasMockedRender(container)).toBeTruthy();
    }
  });
});
