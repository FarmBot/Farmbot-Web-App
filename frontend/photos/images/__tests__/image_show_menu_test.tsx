import React from "react";
import { mount } from "enzyme";
import { Actions } from "../../../constants";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import { ImageShowMenu, ImageShowMenuTarget } from "../image_show_menu";
import { fakeImageShowFlags } from "../../../__test_support__/fake_camera_data";
import { ImageShowProps } from "../interfaces";

describe("<ImageShowMenu />", () => {
  const fakeProps = (): ImageShowProps => ({
    image: fakeImage(),
    dispatch: jest.fn(),
    flags: fakeImageShowFlags(),
    size: { width: 0, height: 0 },
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

describe("<ImageShowMenuTarget />", () => {
  const fakeProps = (): ImageShowProps => ({
    image: undefined,
    dispatch: jest.fn(),
    flags: fakeImageShowFlags(),
    size: { width: 0, height: 0 },
  });

  it("handles missing image", () => {
    const p = fakeProps();
    const wrapper = mount(<ImageShowMenuTarget {...p} />);
    expect(wrapper.html()).toContain("fa-eye");
    wrapper.simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: undefined,
    });
  });
});
