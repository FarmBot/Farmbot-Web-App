import * as React from "react";
import { WeedDetectorSlider } from "../slider";
import { shallow } from "enzyme";

jest.useFakeTimers();
describe("Weed detector slider", () => {
  it("sets props", () => {
    const results = new WeedDetectorSlider({
      onRelease: jest.fn(),
      highest: 99,
      lowest: 1,
      lowValue: 3,
      highValue: 5,
    });

    expect(results.props.highest).toEqual(99);
  });

  it("releases the slider", () => {
    const onRelease = jest.fn();
    const el = shallow<WeedDetectorSlider>(<WeedDetectorSlider
      onRelease={onRelease}
      highest={99}
      lowest={1}
      lowValue={3}
      highValue={5} />);
    el.simulate("release", [5, 6]);
    jest.runAllTimers();
    expect(onRelease).toHaveBeenCalledWith([5, 6]);
    const { highValue, lowValue } = el.instance().state;
    expect(highValue).toBeUndefined();
    expect(lowValue).toBeUndefined();
  });
});
