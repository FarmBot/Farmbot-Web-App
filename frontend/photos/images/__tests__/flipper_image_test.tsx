import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { FlipperImage } from "../flipper_image";
import { FlipperImageProps } from "../interfaces";
import { PLACEHOLDER_FARMBOT, PLACEHOLDER_FARMBOT_DARK } from "../image_flipper";
import { fakeImage } from "../../../__test_support__/fake_state/resources";

jest.mock("../../../farm_designer/map/layers/images/map_image", () => ({
  MapImage: () => <g id={"map-image-mock"} />,
}));

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
    const { container } = render(<FlipperImage {...p} />);
    const img = container.querySelector(".no-flipper-image-container img");
    expect(img?.getAttribute("src")).toEqual(PLACEHOLDER_FARMBOT);
  });

  it("renders dark placeholder", () => {
    const p = fakeProps();
    p.image.body.attachment_processed_at = undefined;
    p.dark = true;
    const { container } = render(<FlipperImage {...p} />);
    const img = container.querySelector(".no-flipper-image-container img");
    expect(img?.getAttribute("src")).toEqual(PLACEHOLDER_FARMBOT_DARK);
  });

  it("renders placeholder at specific size", () => {
    Object.defineProperty(document, "getElementById", {
      value: () => ({ clientWidth: 200, clientHeight: 100 }),
      configurable: true
    });
    const p = fakeProps();
    p.image.body.attachment_processed_at = undefined;
    const { container } = render(<FlipperImage {...p} />);
    const img = container.querySelector(".no-flipper-image-container img");
    expect(img?.getAttribute("src")).toEqual(PLACEHOLDER_FARMBOT);
    expect(img?.getAttribute("width")).toEqual("200");
    expect(img?.getAttribute("height")).toEqual("100");
  });

  it("renders placeholder at default size", () => {
    Object.defineProperty(document, "getElementById", {
      value: () => ({}), configurable: true
    });
    const p = fakeProps();
    p.image.body.attachment_processed_at = undefined;
    const { container } = render(<FlipperImage {...p} />);
    const img = container.querySelector(".no-flipper-image-container img");
    expect(img?.getAttribute("src")).toEqual(PLACEHOLDER_FARMBOT);
    expect(img?.getAttribute("width")).toEqual(null);
    expect(img?.getAttribute("height")).toEqual(null);
  });

  it("knows when image is loaded", () => {
    const p = fakeProps();
    const { container } = render(<FlipperImage {...p} />);
    expect(container.querySelector(".no-flipper-image-container"))
      .toBeTruthy();
    const image = container.querySelector(".flipper-image img") as HTMLElement;
    fireEvent.load(image);
    expect(container.querySelector(".no-flipper-image-container")).toBeNull();
    expect(p.onImageLoad).toHaveBeenCalled();
  });

  it("transforms image", () => {
    const p = fakeProps();
    p.image.body.id = undefined;
    p.transformImage = true;
    p.crop = true;
    p.getConfigValue = () => 2;
    const { container } = render(<FlipperImage {...p} />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("calls back on transformed image load", () => {
    const p = fakeProps();
    const instance = new FlipperImage(p);
    instance.setState = (update: Partial<{
      isLoaded: boolean;
      width: number | undefined;
      height: number | undefined;
    }>) => { instance.state = { ...instance.state, ...update }; };
    expect(instance.state).toEqual({
      isLoaded: false, width: undefined, height: undefined,
    });
    const fakeImg = new Image();
    Object.defineProperty(fakeImg, "naturalWidth", {
      value: 1, configurable: true,
    });
    Object.defineProperty(fakeImg, "naturalHeight", {
      value: 2, configurable: true,
    });
    instance.onImageLoad(fakeImg);
    expect(p.onImageLoad).toHaveBeenCalledWith(fakeImg);
    expect(instance.state).toEqual({ isLoaded: true, width: 1, height: 2 });
  });

  it("hovers image", () => {
    const p = fakeProps();
    p.hover = jest.fn();
    const { container } = render(<FlipperImage {...p} />);
    fireEvent.mouseEnter(container.querySelector(".image-jsx") as HTMLElement);
    expect(p.hover).toHaveBeenCalledWith(p.image.uuid);
  });

  it("unhovers image", () => {
    const p = fakeProps();
    p.hover = jest.fn();
    const { container } = render(<FlipperImage {...p} />);
    fireEvent.mouseLeave(container.querySelector(".image-jsx") as HTMLElement);
    expect(p.hover).toHaveBeenCalledWith(undefined);
  });

  it("handles missing hover function", () => {
    const { container } = render(<FlipperImage {...fakeProps()} />);
    const image = container.querySelector(".image-jsx") as HTMLElement;
    fireEvent.mouseEnter(image);
    fireEvent.mouseLeave(image);
  });
});
