import React from "react";
import { mount } from "enzyme";
import { TourList } from "../list";
import { TourListProps } from "../interfaces";

describe("<TourList />", () => {
  const fakeProps = (): TourListProps => ({
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<TourList {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("start tour");
  });
});
