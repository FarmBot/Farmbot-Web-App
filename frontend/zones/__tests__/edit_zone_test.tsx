import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  RawEditZone as EditZone, EditZoneProps, mapStateToProps,
} from "../edit_zone";
import { fakeState } from "../../__test_support__/fake_state";
import { fakePointGroup } from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import * as crud from "../../api/crud";
import { Path } from "../../internal_urls";

beforeEach(() => {
  jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  jest.spyOn(crud, "save").mockImplementation(jest.fn());
});

afterEach(() => {
  jest.restoreAllMocks();
});
describe("<EditZone />", () => {
  const fakeProps = (): EditZoneProps => ({
    dispatch: jest.fn(),
    findZone: () => undefined,
    botSize: {
      x: { value: 3000, isDefault: true },
      y: { value: 1500, isDefault: true },
      z: { value: 400, isDefault: true },
    },
  });

  it("redirects", () => {
    location.pathname = Path.mock(Path.zones("nope"));
    const { container } = render(<EditZone {...fakeProps()} />);
    expect(container.textContent).toContain("Redirecting...");
    expect(mockNavigate).toHaveBeenCalledWith(Path.zones());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const { container } = render(<EditZone {...fakeProps()} />);
    expect(container.textContent).toContain("Redirecting...");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("renders", () => {
    location.pathname = Path.mock(Path.zones(1));
    const p = fakeProps();
    p.findZone = () => fakePointGroup();
    const { container } = render(<EditZone {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("edit");
  });

  it("changes name", () => {
    location.pathname = Path.mock(Path.zones(1));
    const p = fakeProps();
    const group = fakePointGroup();
    p.findZone = () => group;
    const { container } = render(<EditZone {...p} />);
    const input = container.querySelector("input");
    expect(input).toBeTruthy();
    fireEvent.blur(input as Element, {
      currentTarget: { value: "new name" },
      target: { value: "new name" },
    });
    expect(crud.edit).toHaveBeenCalledWith(group, { name: "new name" });
    expect(crud.save).toHaveBeenCalledWith(group.uuid);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakePointGroup()]);
    const props = mapStateToProps(state);
    expect(props.findZone(1)).toEqual(undefined);
  });
});
