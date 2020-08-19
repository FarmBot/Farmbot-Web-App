jest.mock("../actions", () => ({
  setWebAppConfigValues: jest.fn(),
}));

import React from "react";
import { shallow, mount } from "enzyme";
import { FilterNearTime } from "../filter_near_time";
import { ImageFilterProps } from "../../images/interfaces";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import { fakeImageShowFlags } from "../../../__test_support__/fake_camera_data";
import { setWebAppConfigValues } from "../actions";

describe("<FilterNearTime />", () => {
  const fakeProps = (): ImageFilterProps => ({
    image: fakeImage(),
    dispatch: jest.fn(),
    flags: fakeImageShowFlags(),
  });

  it("changes value", () => {
    const p = fakeProps();
    const wrapper = shallow<FilterNearTime>(
      <FilterNearTime {...p} />);
    expect(wrapper.state().seconds).toEqual(60);
    wrapper.find("input").simulate("change", { currentTarget: { value: "2" } });
    expect(wrapper.state().seconds).toEqual(120);
  });

  it("sets filter settings for around image time", () => {
    const p = fakeProps();
    p.image && (p.image.body.created_at = "2001-01-03T05:00:01.000Z");
    const wrapper = mount<FilterNearTime>(
      <FilterNearTime {...p} />);
    wrapper.setState({ seconds: 120 });
    wrapper.find(".this-image-section").find("button").simulate("click");
    expect(setWebAppConfigValues).toHaveBeenCalledWith({
      photo_filter_begin: "2001-01-03T04:58:01.000Z",
      photo_filter_end: "2001-01-03T05:02:01.000Z",
    });
  });
});
