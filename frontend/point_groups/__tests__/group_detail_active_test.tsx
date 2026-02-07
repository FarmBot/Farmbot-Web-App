import React from "react";
import {
  GroupDetailActive, GroupDetailActiveProps, GroupSortSelection,
  GroupSortSelectionProps,
} from "../group_detail_active";
import { mount } from "enzyme";
import {
  fakePointGroup, fakePlant, fakePoint,
} from "../../__test_support__/fake_state/resources";
import { SpecialStatus } from "farmbot";
import { DEFAULT_CRITERIA } from "../criteria/interfaces";
import * as selectPlants from "../../plants/select_plants";
import { fakeToolTransformProps } from "../../__test_support__/fake_tool_info";
import { cloneDeep } from "lodash";
import * as mapActions from "../../farm_designer/map/actions";
import * as uiHelp from "../../ui/help";

let setSelectionPointTypeSpy: jest.SpyInstance;
let validPointTypesSpy: jest.SpyInstance;
let pointerTypeListSpy: jest.SpyInstance;
let setHoveredPlantSpy: jest.SpyInstance;
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
  setHoveredPlantSpy = jest.spyOn(mapActions, "setHoveredPlant")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  helpSpy.mockRestore();
  setSelectionPointTypeSpy.mockRestore();
  validPointTypesSpy.mockRestore();
  pointerTypeListSpy.mockRestore();
  setHoveredPlantSpy.mockRestore();
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
    const p = fakeProps();
    const wrapper = mount<GroupDetailActive>(<GroupDetailActive {...p} />);
    expect(wrapper.state().iconDisplay).toBeTruthy();
    wrapper.instance().toggleIconShow();
    expect(wrapper.state().iconDisplay).toBeFalsy();
  });

  it("renders", () => {
    const p = fakeProps();
    p.group.specialStatus = SpecialStatus.SAVED;
    const wrapper = mount(<GroupDetailActive {...p} />);
    expect(wrapper.find(".group-member-display").length).toEqual(1);
  });

  it("unmounts", () => {
    const p = fakeProps();
    p.group.body.criteria.string_eq.pointer_type = ["Weed"];
    const wrapper = mount(<GroupDetailActive {...p} />);
    wrapper.unmount();
    expect(selectPlants.setSelectionPointType).toHaveBeenCalledWith(undefined);
  });

  it("doesn't show icons", () => {
    const wrapper = mount(<GroupDetailActive {...fakeProps()} />);
    wrapper.setState({ iconDisplay: false });
    expect(wrapper.find(".point-list-wrapper").length).toEqual(0);
  });
});

describe("<GroupSortSelection />", () => {
  const fakeProps = (): GroupSortSelectionProps => ({
    group: fakePointGroup(),
    dispatch: jest.fn(),
    pointsSelectedByGroup: [fakePoint()],
  });

  it("renders", () => {
    const wrapper = mount(<GroupSortSelection {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("ascending");
  });

  it("renders random notice", () => {
    const p = fakeProps();
    p.group.body.sort_type = "random";
    const wrapper = mount(<GroupSortSelection {...p} />);
    expect(wrapper.html()).toContain("exclamation-triangle");
  });
});
