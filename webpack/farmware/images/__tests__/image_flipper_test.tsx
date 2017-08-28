import "../../../unmock_i18next";
import { ImageFlipper } from "../image_flipper";
import { fakeImages } from "../../../__test_support__/fake_state/images";
import { TaggedImage } from "../../../resources/tagged_resources";
import { defensiveClone } from "../../../util";

describe("<ImageFlipper/>", () => {
  const images: TaggedImage[] = [];

  fakeImages.forEach((item, index) => {
    const image = defensiveClone(item);
    image.uuid = `Position ${index}`;
    images.push(image);
  });

  it("defaults to index 0", () => {
    const onFlip = jest.fn();
    const x = new ImageFlipper();
    const currentImage = undefined;
    x.props = { images, currentImage, onFlip };
    const up = x.go(1);
    up();
    expect(onFlip).toHaveBeenCalledWith(images[1].uuid);
  });

  it("stops at end");
  it("Flips down");
  it("Flips up");
});
