jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import * as React from "react";
import { shallow } from "enzyme";
import {
  EditPointLocation, EditPointLocationProps,
  EditPointRadius, EditPointRadiusProps,
  EditPointColor, EditPointColorProps, updatePoint, EditPointName, EditPointNameProps,
} from "../point_edit_actions";
import { fakePoint } from "../../../__test_support__/fake_state/resources";
import { edit, save } from "../../../api/crud";

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
    xyLocation: { x: 1, y: 2 },
  });

  it("edits location", () => {
    const p = fakeProps();
    const wrapper = shallow(<EditPointLocation {...p} />);
    wrapper.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: 3 }
    });
    expect(p.updatePoint).toHaveBeenCalledWith({ x: 3 });
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
});
