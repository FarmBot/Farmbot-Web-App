import "../../unmock_i18next";
import * as React from "react";
import { ImageFlipper } from "../image_flipper";
import { fakeImages } from "../../__test_support__/fake_state/images";
import * as freeze from "deep-freeze";
import { TaggedImage } from "../../resources/tagged_resources";
import { defensiveClone } from "../../util";

describe("<ImageFlipper/>", () => {
  let images: TaggedImage[] = [];

  fakeImages.forEach((item, index) => {
    let image = defensiveClone(item);
    image.uuid = `Position ${index}`;
    images.push(image);
  });

  it("defaults to index 0", () => {
    let onFlip = jest.fn();
    let x = new ImageFlipper();
    let currentImage = undefined;
    x.props = { images, currentImage, onFlip };
    let up = x.go(1);
    up();
    expect(onFlip).toHaveBeenCalledWith(images[1].uuid);
  });

  it("stops at end");
  it("Flips down");
  it("Flips up");
});
