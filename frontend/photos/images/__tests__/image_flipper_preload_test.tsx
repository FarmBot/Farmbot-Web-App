import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { ImageFlipper } from "../image_flipper";
import { fakeImage } from "../../../__test_support__/fake_state/resources";

let originalImage: any;
let createdSources: string[] = [];
class MockImage {
  onload: (() => void) | null = null;
  _src = "";
  naturalWidth = 10;
  naturalHeight = 10;
  set src(value: string) {
    this._src = value;
    createdSources.push(value);
    if (this.onload) { this.onload(); }
  }
  get src() { return this._src; }
}

beforeEach(() => {
  createdSources = [];
  originalImage = window.Image;
  (window as any).Image = MockImage;
});

afterEach(() => {
  (window as any).Image = originalImage;
});

const makeImages = () =>
  Array.from({ length: 4 }, (_, i) => {
    const img = fakeImage();
    img.uuid = `${i}`;
    img.body.attachment_processed_at = "now";
    img.body.attachment_url = `url${i}`;
    return img;
  });

test("preloads current and previous images", async () => {
  const imgs = makeImages();
  const props = {
    id: "flipper",
    dispatch: jest.fn(),
    images: imgs,
    currentImage: imgs[3],
    currentImageSize: { width: undefined, height: undefined },
    crop: false,
    env: {},
    getConfigValue: jest.fn(),
    transformImage: false,
  };
  render(<ImageFlipper {...props} />);
  await waitFor(() => expect(createdSources.length).toBe(4));
  expect(createdSources).toEqual(["url3", "url2", "url1", "url0"]);
});

test("shows preloaded image without loader", async () => {
  const imgs = makeImages();
  const props = {
    id: "flipper",
    dispatch: jest.fn(),
    images: imgs,
    currentImage: imgs[3],
    currentImageSize: { width: undefined, height: undefined },
    crop: false,
    env: {},
    getConfigValue: jest.fn(),
    transformImage: false,
  };
  const { rerender } = render(<ImageFlipper {...props} />);
  await waitFor(() => expect(createdSources.length).toBe(4));
  rerender(<ImageFlipper {...{ ...props, currentImage: imgs[2] }} />);
  await waitFor(() =>
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument(),
    { timeout: 2000 });
});
