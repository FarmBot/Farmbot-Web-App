jest.mock("../group_detail_active", () => ({
  GroupDetailActive: () => <div />,
  GroupSortSelection: () => <div />,
}));

jest.mock("../../api/crud", () => ({
  destroy: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import { GroupDetailActive } from "../group_detail_active";
import {
  RawGroupDetail as GroupDetail, findGroupFromUrl, mapStateToProps,
  GroupDetailProps,
} from "../group_detail";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";
import { fakeToolTransformProps } from "../../__test_support__/fake_tool_info";
import {
  fakePlant,
  fakePointGroup, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { PointType } from "farmbot";
import { destroy } from "../../api/crud";
import { Path } from "../../internal_urls";

describe("<GroupDetail />", () => {
  const fakeProps = (): GroupDetailProps => {
    const group = fakePointGroup();
    group.body.name = "one";
    group.body.id = 1;
    group.body.point_ids = [23];
    return {
      dispatch: jest.fn(),
      group: group,
      allPoints: [],
      slugs: [],
      hovered: undefined,
      editGroupAreaInMap: false,
      botSize: fakeBotSize(),
      selectionPointType: undefined,
      tools: [],
      toolTransformProps: fakeToolTransformProps(),
      tryGroupSortType: undefined,
    };
  };

  it("redirects when group is not found", () => {
    location.pathname = Path.mock(Path.groups(-1));
    history.back = jest.fn();
    const p = fakeProps();
    p.group = undefined;
    const wrapper = mount(<GroupDetail {...p} />);
    expect(wrapper.find(GroupDetailActive).length).toEqual(0);
    expect(history.back).toHaveBeenCalled();
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    history.back = jest.fn();
    const p = fakeProps();
    p.group = undefined;
    mount(<GroupDetail {...p} />);
    expect(history.back).not.toHaveBeenCalled();
  });

  it("renders groups", () => {
    location.pathname = Path.mock(Path.groups(1));
    history.back = jest.fn();
    const wrapper = mount(<GroupDetail {...fakeProps()} />);
    expect(wrapper.find(GroupDetailActive).length).toEqual(1);
    expect(history.back).not.toHaveBeenCalled();
  });

  it.each<[string, PointType]>([
    ["plants", "Plant"],
    ["weeds", "Weed"],
    ["points", "GenericPointer"],
    ["tools", "ToolSlot"],
  ])("renders %s group", (title, pointerType) => {
    location.pathname = Path.mock(Path.groups(1));
    const p = fakeProps();
    p.group && (p.group.body.criteria.string_eq = { pointer_type: [pointerType] });
    const wrapper = mount(<GroupDetail {...p} />);
    expect(wrapper.html()).toContain("go back to " + title);
  });

  it("deletes group", () => {
    location.pathname = Path.mock(Path.groups(1));
    const wrapper = mount(<GroupDetail {...fakeProps()} />);
    wrapper.find(".fa-trash").first().simulate("click");
    expect(destroy).toHaveBeenCalled();
  });
});

describe("findGroupFromUrl()", () => {
  it("finds group from URL", () => {
    location.pathname = Path.mock(Path.groups(1));
    const group = fakePointGroup();
    group.body.id = 1;
    const otherGroup = fakePointGroup();
    otherGroup.body.id = 2;
    expect(findGroupFromUrl([group])).toEqual(group);
  });

  it("fails to find group from URL", () => {
    location.pathname = Path.mock(Path.groups(1));
    expect(findGroupFromUrl([])).toEqual(undefined);
  });

  it("fails to find group from URL: undefined array item", () => {
    location.pathname = Path.mock(Path.groups());
    expect(findGroupFromUrl([])).toEqual(undefined);
  });

  it("doesn't try to find a group when at a different URL", () => {
    location.pathname = Path.mock(Path.logs());
    const group = fakePointGroup();
    group.body.id = 1;
    expect(findGroupFromUrl([group])).toEqual(undefined);
  });
});

describe("mapStateToProps()", () => {
  it("returns quadrant", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.bot_origin_quadrant = 2;
    state.resources = buildResourceIndex([webAppConfig]);
    expect(mapStateToProps(state).toolTransformProps.quadrant).toEqual(2);
  });

  it("returns default quadrant", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.bot_origin_quadrant = 9;
    const plant = fakePlant();
    plant.body.openfarm_slug = "mint";
    state.resources = buildResourceIndex([webAppConfig, plant]);
    const props = mapStateToProps(state);
    expect(props.toolTransformProps.quadrant).toEqual(2);
    expect(props.slugs).toEqual(["mint"]);
  });
});
