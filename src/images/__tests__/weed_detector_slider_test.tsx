import { WeedDetectorSlider } from "../weed_detector/slider";

describe("Weed detector slider", () => {
  it("sets props", () => {
    let results = new WeedDetectorSlider({
      onRelease: jest.fn(),
      highest: 99,
      lowest: 1,
      lowValue: 3,
      highValue: 5,
    });

    expect(results.props.highest).toEqual(99);
  });
});
