import React from "react";
import {
  GroupDetailActive, GroupDetailActiveProps, GroupSortSelection,
  GroupSortSelectionProps,
} from "../group_detail_active";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  fakePointGroup, fakePlant, fakePoint,
} from "../../__test_support__/fake_state/resources";
import { SpecialStatus } from "farmbot";
import { DEFAULT_CRITERIA } from "../criteria/interfaces";
import * as selectPlants from "../../plants/select_plants";
import { fakeToolTransformProps } from "../../__test_support__/fake_tool_info";
import { cloneDeep } from "lodash";
import * as uiHelp from "../../ui/help";

let setSelectionPointTypeSpy: jest.SpyInstance;
let validPointTypesSpy: jest.SpyInstance;
let pointerTypeListSpy: jest.SpyInstance;
let helpSpy: jest.SpyInstance;

beforeEach(() => {
  helpSpy = jest.spyOn(uiHelp, "Help")
    .mockImplementation(props => <p>{props.text}{props.customIcon}</p>);
  setSelectionPointTypeSpy = jest.spyOn(selectPlants, "setSelectionPointType")
    .mockImplementation(jest.fn());
  validPointTypesSpy = jest.spyOn(selectPlants, "validPointTypes")
    .mockImplementation(jest.fn());
  pointerTypeListSpy = jest.spyOn(selectPlants, "POINTER_TYPE_LIST")
    .mockImplementation(() => []);
});

afterEach(() => {
  helpSpy.mockRestore();
  setSelectionPointTypeSpy.mockRestore();
  validPointTypesSpy.mockRestore();
  pointerTypeListSpy.mockRestore();
});

describe("<GroupDetailActive />", () => {
  const fakeProps = (): GroupDetailActiveProps => {
    const plant = fakePlant();
    plant.body.id = 1;
    const group = fakePointGroup();
    group.body.criteria = cloneDeep(DEFAULT_CRITERIA);
    group.specialStatus = SpecialStatus.DIRTY;
    group.body.name = "XYZ";
    group.body.point_ids = [plant.body.id];
    return {
      dispatch: jest.fn(),
      group,
      allPoints: [plant],
      slugs: [],
      hovered: undefined,
      editGroupAreaInMap: false,
      botSize: {
        x: { value: 3000, isDefault: true },
        y: { value: 1500, isDefault: true },
        z: { value: 400, isDefault: true },
      },
      selectionPointType: undefined,
      tools: [],
      toolTransformProps: fakeToolTransformProps(),
      tryGroupSortType: undefined,
    };
  };

  it("toggles icon view", () => {
    render(<GroupDetailActive {...fakeProps()} />);
    expect(document.querySelector(".point-list-wrapper")).toBeTruthy();
    fireEvent.click(screen.getByTitle("hide icons"));
    expect(document.querySelector(".point-list-wrapper")).toBeFalsy();
  });

  it("renders", () => {
    const p = fakeProps();
    p.group.specialStatus = SpecialStatus.SAVED;
    render(<GroupDetailActive {...p} />);
    expect(document.querySelectorAll(".group-member-display").length).toEqual(1);
  });

  it("unmounts", () => {
    const p = fakeProps();
    p.group.body.criteria.string_eq.pointer_type = ["Weed"];
    const { unmount } = render(<GroupDetailActive {...p} />);
    unmount();
    expect(selectPlants.setSelectionPointType).toHaveBeenCalledWith(undefined);
  });

  it("doesn't show icons", () => {
    render(<GroupDetailActive {...fakeProps()} />);
    fireEvent.click(screen.getByTitle("hide icons"));
    expect(document.querySelectorAll(".point-list-wrapper").length).toEqual(0);
  });
});

describe("<GroupSortSelection />", () => {
  const fakeProps = (): GroupSortSelectionProps => ({
    group: fakePointGroup(),
    dispatch: jest.fn(),
    pointsSelectedByGroup: [fakePoint()],
  });

  it("renders", () => {
    render(<GroupSortSelection {...fakeProps()} />);
    expect(screen.getAllByText(/ascending/i).length).toBeGreaterThan(0);
  });

  it("renders random notice", () => {
    const p = fakeProps();
    p.group.body.sort_type = "random";
    const { container } = render(<GroupSortSelection {...p} />);
    expect(container.textContent).toContain("fa-exclamation-triangle");
  });
});
