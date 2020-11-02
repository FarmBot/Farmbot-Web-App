jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  fakeFbosConfig, fakePoint,
} from "../../__test_support__/fake_state/resources";
import {
  EditSoilHeight, EditSoilHeightProps, getSoilHeightColor,
  tagAsSoilHeight, toggleSoilHeight,
} from "../soil_height";
import { edit } from "../../api/crud";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";

describe("toggleSoilHeight()", () => {
  it("returns update", () => {
    const point = fakePoint();
    point.body.meta = {};
    expect(toggleSoilHeight(point)).toEqual({
      meta: { at_soil_level: "true" }
    });
    tagAsSoilHeight(point);
    expect(toggleSoilHeight(point)).toEqual({
      meta: { at_soil_level: "false" }
    });
  });
});

describe("getSoilHeightColor()", () => {
  it("returns color", () => {
    const point0 = fakePoint();
    tagAsSoilHeight(point0);
    point0.body.z = 0;
    const point1 = fakePoint();
    tagAsSoilHeight(point1);
    point1.body.z = 100;
    const getColor = getSoilHeightColor([point0, point1]);
    expect(getColor(50)).toEqual("rgb(128, 128, 128)");
  });
});

describe("<EditSoilHeight />", () => {
  const fakeProps = (): EditSoilHeightProps => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakeFbosConfig()]);
    return {
      dispatch: mockDispatch(jest.fn(), () => state),
      sourceFbosConfig: () => ({ value: 100, consistent: true }),
      averageZ: 150,
    };
  };

  it("uses average", () => {
    const wrapper = mount(<EditSoilHeight {...fakeProps()} />);
    expect(wrapper.find("input").props().value).toEqual(100);
    wrapper.find("button").simulate("click");
    expect(edit).toHaveBeenCalledWith(expect.any(Object), { soil_height: 150 });
  });

  it("changes soil height", () => {
    const wrapper = shallow(<EditSoilHeight {...fakeProps()} />);
    wrapper.find("BlurableInput").simulate("commit", {
      currentTarget: { value: "123" }
    });
    expect(edit).toHaveBeenCalledWith(expect.any(Object), { soil_height: 123 });
  });

  it("doesn't change soil height", () => {
    const p = fakeProps();
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    p.dispatch = mockDispatch(jest.fn(), () => state);
    const wrapper = shallow(<EditSoilHeight {...p} />);
    wrapper.find("BlurableInput").simulate("commit", {
      currentTarget: { value: "123" }
    });
    expect(edit).not.toHaveBeenCalled();
  });
});
