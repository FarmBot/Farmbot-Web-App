import React from "react";
import { WebcamImg } from "../webcam_img";
import { fireEvent, render } from "@testing-library/react";
import { WebcamImgProps } from "../interfaces";
import { PLACEHOLDER_FARMBOT } from "../../../photos/images/image_flipper";

describe("<WebcamImg />", () => {
  const fakeProps = (): WebcamImgProps => ({
    src: "url",
  });

  it("renders img", () => {
    const { container } = render(<WebcamImg {...fakeProps()} />);
    const content = container.querySelector(".webcam-stream-valid img[src='url']");
    expect(content).toBeTruthy();
    content && fireEvent.load(content);
    expect(content?.getAttribute("src")).toEqual("url");
  });

  it("renders iframe", () => {
    const p = fakeProps();
    p.src = "iframe url";
    const { container } = render(<WebcamImg {...p} />);
    const content = container.querySelector("iframe");
    expect(content).toBeTruthy();
    expect(content?.getAttribute("src")).toEqual("url");
  });

  it("falls back", () => {
    const { container } = render(<WebcamImg {...fakeProps()} />);
    const initialImg = container.querySelector(".webcam-stream-valid img[src='url']");
    initialImg && fireEvent.error(initialImg);
    const fallbackImg = container.querySelector(".webcam-stream-unavailable img");
    expect(fallbackImg).toBeTruthy();
    expect(fallbackImg?.getAttribute("src")).toEqual(PLACEHOLDER_FARMBOT);
  });
});
