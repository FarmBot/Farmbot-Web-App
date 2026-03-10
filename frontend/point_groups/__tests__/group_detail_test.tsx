import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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
import * as crud from "../../api/crud";
import { Path } from "../../internal_urls";

let destroySpy: jest.SpyInstance;

beforeEach(() => {
  destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
});

afterEach(() => {
  destroySpy.mockRestore();
});

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
    render(<GroupDetail {...p} />);
    expect(screen.queryByText("GROUP MEMBERS (0)")).not.toBeInTheDocument();
    expect(history.back).toHaveBeenCalled();
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    history.back = jest.fn();
    const p = fakeProps();
    p.group = undefined;
    render(<GroupDetail {...p} />);
    expect(history.back).not.toHaveBeenCalled();
  });

  it("renders groups", () => {
    location.pathname = Path.mock(Path.groups(1));
    history.back = jest.fn();
    const { container } = render(<GroupDetail {...fakeProps()} />);
    expect(container.querySelectorAll(".group-member-display").length).toEqual(1);
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
    render(<GroupDetail {...p} />);
    expect(screen.getByTitle("go back to " + title)).toBeInTheDocument();
  });

  it("deletes group", () => {
    location.pathname = Path.mock(Path.groups(1));
    const { container } = render(<GroupDetail {...fakeProps()} />);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
    expect(crud.destroy).toHaveBeenCalled();
  });
});

describe("findGroupFromUrl()", () => {
  it("finds group from URL", () => {
    location.pathname = Path.mock(Path.groups(1));
    const group = fakePointGroup();
    group.body.id = 1;
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
