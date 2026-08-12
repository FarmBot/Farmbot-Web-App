import React from "react";
import { render, fireEvent } from "@testing-library/react";
import {
  fakeFbosConfig, fakePoint,
} from "../../__test_support__/fake_state/resources";
import {
  EditSoilHeight, EditSoilHeightProps, getSoilHeightColor,
  tagAsSoilHeight, toggleSoilHeight,
} from "../soil_height";
import * as crud from "../../api/crud";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { changeBlurableInput } from "../../__test_support__/helpers";

beforeEach(() => {
  jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  jest.spyOn(crud, "save").mockImplementation(jest.fn());
});

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
    expect(getColor(50).rgb).toEqual("rgb(128, 128, 128)");
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
      minZ: -550,
      maxZ: -450,
    };
  };

  it("uses average", () => {
    const { container } = render(<EditSoilHeight {...fakeProps()} />);
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("100");
    fireEvent.click(container.querySelector("button") as Element);
    expect(crud.edit).toHaveBeenCalledWith(expect.any(Object), { soil_height: 150 });
    expect(container).toHaveTextContent("Min soil z");
    expect(container).toHaveTextContent("Max soil z");
    const limits = container.querySelectorAll(".soil-height-limit");
    expect([...limits].map(input => (input as HTMLInputElement).value))
      .toEqual(["-550", "-450"]);
    limits.forEach(input => expect(input).toBeDisabled());
  });

  it("changes soil height", () => {
    const { container } = render(<EditSoilHeight {...fakeProps()} />);
    changeBlurableInput(container, "123");
    expect(crud.edit).toHaveBeenCalledWith(expect.any(Object), { soil_height: 123 });
  });

  it("keeps average controls when min and max are unavailable", () => {
    const p = fakeProps();
    p.minZ = undefined;
    p.maxZ = undefined;
    const { container } = render(<EditSoilHeight {...p} />);
    expect(container).toHaveTextContent("use average z: 150");
    expect(container).not.toHaveTextContent("Min soil z");
    expect(container).not.toHaveTextContent("Max soil z");
  });

  it("doesn't change soil height", () => {
    const p = fakeProps();
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    p.dispatch = mockDispatch(jest.fn(), () => state);
    const { container } = render(<EditSoilHeight {...p} />);
    changeBlurableInput(container, "123");
    expect(crud.edit).not.toHaveBeenCalled();
  });
});
