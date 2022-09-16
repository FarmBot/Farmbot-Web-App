import * as React from "react";
import { WeedDetectorSlider, SliderProps } from "../slider";
import { shallow } from "enzyme";

jest.useFakeTimers();
describe("<WeedDetectorSlider />", () => {
  const fakeProps = (): SliderProps => ({
    onRelease: jest.fn(),
    highest: 99,
    lowest: 1,
    lowValue: 3,
    highValue: 5,
  });

  it("changes the slider", () => {
    const wrapper = shallow<WeedDetectorSlider>(
      <WeedDetectorSlider {...fakeProps()} />);
    wrapper.simulate("change", [1, 100]);
    expect(wrapper.state().lowValue).toEqual(1);
    expect(wrapper.state().highValue).toEqual(100);
  });

  it("handles incorrect value type", () => {
    const p = fakeProps();
    p.lowValue = "nope" as unknown as number;
    expect(() => shallow(<WeedDetectorSlider {...p} />))
      .toThrow("Something other than number");
  });

  it("releases the slider", () => {
    const p = fakeProps();
    const wrapper = shallow<WeedDetectorSlider>(<WeedDetectorSlider {...p} />);
    wrapper.simulate("release", [5, 6]);
    jest.runAllTimers();
    expect(p.onRelease).toHaveBeenCalledWith([5, 6]);
    expect(wrapper.state().highValue).toBeUndefined();
    expect(wrapper.state().lowValue).toBeUndefined();
  });
});
