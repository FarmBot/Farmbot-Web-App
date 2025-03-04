jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

jest.mock("../soil_height", () => ({
  toggleSoilHeight: jest.fn(),
  soilHeightPoint: jest.fn(),
}));

import React from "react";
import { shallow, mount } from "enzyme";
import {
  EditPointLocation, EditPointLocationProps,
  EditPointRadius, EditPointRadiusProps,
  EditPointColor, EditPointColorProps, updatePoint, EditPointName,
  EditPointNameProps,
  EditPointSoilHeightTag,
  EditPointSoilHeightTagProps,
  EditWeedProperties,
  EditWeedPropertiesProps,
} from "../point_edit_actions";
import {
  fakePoint, fakeWeed,
} from "../../__test_support__/fake_state/resources";
import { edit, save } from "../../api/crud";
import { toggleSoilHeight } from "../soil_height";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";

describe("updatePoint()", () => {
  it("updates a point", () => {
    const point = fakePoint();
    updatePoint(point, jest.fn())({ radius: 100 });
    expect(edit).toHaveBeenCalledWith(point, { radius: 100 });
    expect(save).toHaveBeenCalledWith(point.uuid);
  });

  it("doesn't update point", () => {
    updatePoint(undefined, jest.fn())({ radius: 100 });
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
});

describe("<EditPointName />", () => {
  const fakeProps = (): EditPointNameProps => ({
    updatePoint: jest.fn(),
    name: "point name",
  });

  it("edits name", () => {
    const p = fakeProps();
    const wrapper = shallow(<EditPointName {...p} />);
    wrapper.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: "new point name" }
    });
    expect(p.updatePoint).toHaveBeenCalledWith({ name: "new point name" });
  });
});

describe("<EditPointLocation />", () => {
  const fakeProps = (): EditPointLocationProps => ({
    updatePoint: jest.fn(),
    pointLocation: { x: 1, y: 2, z: 0 },
    botOnline: true,
    dispatch: jest.fn(),
    defaultAxes: "XY",
    arduinoBusy: false,
    currentBotLocation: { x: 10, y: 20, z: 30 },
    movementState: fakeMovementState(),
  });

  it("edits location", () => {
    const p = fakeProps();
    const wrapper = shallow(<EditPointLocation {...p} />);
    wrapper.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: 3 }
    });
    expect(p.updatePoint).toHaveBeenCalledWith({ x: 3 });
  });

  it("allows negative z values", () => {
    const p = fakeProps();
    const wrapper = shallow(<EditPointLocation {...p} />);
    expect(wrapper.find("BlurableInput").first().props().min).toEqual(0);
    expect(wrapper.find("BlurableInput").last().props().min).toEqual(undefined);
  });
});

describe("<EditPointRadius />", () => {
  const fakeProps = (): EditPointRadiusProps => ({
    updatePoint: jest.fn(),
    radius: 100,
  });

  it("edits radius", () => {
    const p = fakeProps();
    const wrapper = shallow(<EditPointRadius {...p} />);
    wrapper.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: 300 }
    });
    expect(p.updatePoint).toHaveBeenCalledWith({ radius: 300 });
  });
});

describe("<EditPointColor />", () => {
  const fakeProps = (): EditPointColorProps => ({
    updatePoint: jest.fn(),
    color: "red",
  });

  it("edits color", () => {
    const p = fakeProps();
    const wrapper = shallow(<EditPointColor {...p} />);
    wrapper.find("ColorPicker").first().simulate("change", "blue");
    expect(p.updatePoint).toHaveBeenCalledWith({ meta: { color: "blue" } });
  });

  it("edits color from default", () => {
    const p = fakeProps();
    p.color = "";
    const wrapper = shallow(<EditPointColor {...p} />);
    wrapper.find("ColorPicker").first().simulate("change", "blue");
    expect(p.updatePoint).toHaveBeenCalledWith({ meta: { color: "blue" } });
  });
});

describe("<EditPointSoilHeightTag />", () => {
  const fakeProps = (): EditPointSoilHeightTagProps => ({
    updatePoint: jest.fn(),
    point: fakePoint(),
  });

  it("edits soil height flag", () => {
    const p = fakeProps();
    const wrapper = shallow(<EditPointSoilHeightTag {...p} />);
    wrapper.find("input").first().simulate("change");
    expect(toggleSoilHeight).toHaveBeenCalledWith(p.point);
  });
});

describe("<AdditionalWeedProperties />", () => {
  const fakeProps = (): EditWeedPropertiesProps => ({
    weed: fakeWeed(),
    updatePoint: jest.fn(),
    botOnline: true,
    dispatch: jest.fn(),
    defaultAxes: "XY",
    arduinoBusy: false,
    currentBotLocation: { x: 10, y: 20, z: 30 },
    movementState: fakeMovementState(),
  });

  it("renders unknown source", () => {
    const p = fakeProps();
    p.weed.body.meta = {
      meta_key: "meta value", created_by: undefined, key: undefined,
      color: "red", type: "weed",
    };
    const wrapper = mount(<EditWeedProperties {...p} />);
    expect(wrapper.text()).toContain("unknown");
    expect(wrapper.text()).toContain("meta value");
  });

  it("changes method", () => {
    const p = fakeProps();
    p.weed.body.meta = { removal_method: "automatic" };
    const wrapper = shallow(<EditWeedProperties {...p} />);
    wrapper.find("input").last().simulate("change");
    expect(p.updatePoint).toHaveBeenCalledWith({
      meta: { removal_method: "manual" }
    });
  });
});
