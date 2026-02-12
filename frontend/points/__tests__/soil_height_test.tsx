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

afterEach(() => {
  jest.restoreAllMocks();
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
    };
  };

  it("uses average", () => {
    const { container } = render(<EditSoilHeight {...fakeProps()} />);
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("100");
    fireEvent.click(container.querySelector("button") as Element);
    expect(crud.edit).toHaveBeenCalledWith(expect.any(Object), { soil_height: 150 });
  });

  it("changes soil height", () => {
    const { container } = render(<EditSoilHeight {...fakeProps()} />);
    changeBlurableInput(container, "123");
    expect(crud.edit).toHaveBeenCalledWith(expect.any(Object), { soil_height: 123 });
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
