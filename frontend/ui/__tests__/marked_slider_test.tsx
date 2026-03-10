import React from "react";
import { render } from "@testing-library/react";
import { MarkedSlider, MarkedSliderProps } from "../marked_slider";
import { fakeImage } from "../../__test_support__/fake_state/resources";
import { TaggedImage } from "farmbot";

describe("<MarkedSlider />", () => {
  const fakeProps = (): MarkedSliderProps<TaggedImage> => ({
    min: 0,
    max: 100,
    labelStepSize: 1,
    value: 10,
    items: [fakeImage(), fakeImage(), fakeImage()],
    onChange: jest.fn(),
    labelRenderer: () => "",
    itemValue: () => 1,
  });

  it("displays slider", () => {
    const p = fakeProps();
    const { container } = render(<MarkedSlider {...p} />);
    expect(container.innerHTML).not.toContain("vertical");
    expect(container.querySelectorAll(".input-slider").length).toEqual(1);
    expect(container.querySelectorAll(".slider-image").length).toEqual(3);
  });

  it("displays vertical slider", () => {
    const p = fakeProps();
    p.vertical = true;
    const { container } = render(<MarkedSlider {...p} />);
    expect(container.innerHTML).toContain("vertical");
    expect(container.querySelectorAll(".input-slider").length).toEqual(1);
    expect(container.querySelectorAll(".slider-image").length).toEqual(3);
  });
});
