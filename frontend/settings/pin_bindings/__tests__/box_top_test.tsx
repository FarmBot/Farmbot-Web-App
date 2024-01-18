import React from "react";
import { mount } from "enzyme";
import { BoxTop } from "../box_top";
import { BoxTopProps } from "../interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { bot } from "../../../__test_support__/fake_state/bot";

describe("<BoxTop />", () => {
  const fakeProps = (): BoxTopProps => ({
    threeDimensions: false,
    firmwareHardware: "arduino",
    isEditing: true,
    dispatch: jest.fn(),
    resources: buildResourceIndex().index,
    botOnline: true,
    bot,
  });

  it("renders 2D box", () => {
    const p = fakeProps();
    p.threeDimensions = false;
    const wrapper = mount(<BoxTop {...p} />);
    expect(wrapper.find(".box-top-2d-wrapper").length).toEqual(1);
    expect(wrapper.find(".electronics-box-3d-model").length).toEqual(0);
  });

  it("renders 3D box", () => {
    const p = fakeProps();
    p.threeDimensions = true;
    const wrapper = mount(<BoxTop {...p} />);
    expect(wrapper.find(".box-top-2d-wrapper").length).toEqual(0);
    expect(wrapper.find(".electronics-box-3d-model").length).toEqual(1);
  });
});
