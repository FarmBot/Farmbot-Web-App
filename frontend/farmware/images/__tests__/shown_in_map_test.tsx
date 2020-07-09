import * as React from "react";
import { mount } from "enzyme";
import { Actions } from "../../../constants";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import {
  ImageFilterProps, ImageShowMenu, imageInRange, imageIsHidden,
} from "../shown_in_map";
import { fakeImageShowFlags } from "../../../__test_support__/fake_camera_data";

describe("<ImageShowMenu />", () => {
  const fakeProps = (): ImageFilterProps => ({
    image: fakeImage(),
    dispatch: jest.fn(),
    flags: fakeImageShowFlags(),
  });

  it("renders as shown in map", () => {
    const wrapper = mount(<ImageShowMenu {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).not.toContain("not shown in map");
  });

  it("handles missing image", () => {
    const p = fakeProps();
    p.image = undefined;
    const wrapper = mount(<ImageShowMenu {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("not shown in map");
  });

  it("renders as not shown in map", () => {
    const p = fakeProps();
    p.flags.inRange = false;
    const wrapper = mount(<ImageShowMenu {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("not shown in map");
  });

  it("sets map image highlight", () => {
    const p = fakeProps();
    p.image && (p.image.body.id = 1);
    const wrapper = mount(<ImageShowMenu {...p} />);
    wrapper.find(".shown-in-map-details").simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: 1,
    });
    wrapper.find(".shown-in-map-details").simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: undefined,
    });
  });

  it("doesn't set map image highlight", () => {
    const p = fakeProps();
    p.image = undefined;
    const wrapper = mount(<ImageShowMenu {...p} />);
    wrapper.find(".shown-in-map-details").simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: undefined,
    });
  });

  it("hides map image", () => {
    const p = fakeProps();
    p.image && (p.image.body.id = 1);
    const wrapper = mount(<ImageShowMenu {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("hide");
    wrapper.find(".hide-single-image-section").find("button").simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIDE_MAP_IMAGE, payload: 1,
    });
  });

  it("doesn't hide map image", () => {
    const p = fakeProps();
    p.image = undefined;
    const wrapper = mount(<ImageShowMenu {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("hide");
    wrapper.find(".hide-single-image-section").find("button").simulate("click");
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("shows map image", () => {
    const p = fakeProps();
    p.image && (p.image.body.id = 1);
    p.flags.notHidden = false;
    const wrapper = mount(<ImageShowMenu {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("show");
    wrapper.find(".hide-single-image-section").find("button").simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.UN_HIDE_MAP_IMAGE, payload: 1,
    });
  });
});

describe("imageInRange()", () => {
  it("is before", () => {
    const image = fakeImage();
    image.body.created_at = "2018-01-22T05:00:00.000Z";
    const begin = "2018-01-23T05:00:00.000Z";
    const end = "";
    expect(imageInRange(image, begin, end)).toEqual(false);
  });

  it("is after", () => {
    const image = fakeImage();
    image.body.created_at = "2018-01-24T05:00:00.000Z";
    const begin = "";
    const end = "2018-01-23T05:00:00.000Z";
    expect(imageInRange(image, begin, end)).toEqual(false);
  });

  it("is within", () => {
    const image = fakeImage();
    image.body.created_at = "2018-01-24T05:00:00.000Z";
    const begin = "2018-01-23T05:00:00.000Z";
    const end = "2018-01-25T05:00:00.000Z";
    expect(imageInRange(image, begin, end)).toEqual(true);
  });
});

describe("imageIsHidden()", () => {
  it.each<[
    number, number[], number[], boolean, number | undefined, boolean | undefined,
  ]>([
    [1, [], [], false, undefined, undefined],
    [2, [], [], false, 1, false],
    [3, [], [1], false, 1, false],
    [4, [], [1], true, 1, false],
    [5, [], [], true, 1, true],
    [6, [1], [], true, 1, true],
    [7, [1], [1], true, 1, true],
    [8, [1], [1], false, 1, true],
  ])("is hidden: case %s",
    (_, hiddenImages, shownImages, hideUnShownImages, imageId, expected) => {
      expect(imageIsHidden(
        hiddenImages, shownImages, hideUnShownImages, imageId))
        .toEqual(expected);
    });
});
