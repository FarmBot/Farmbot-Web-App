import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import {
  RawWeeds as Weeds,
  WeedsProps,
  mapStateToProps,
  WeedsSection,
  WeedsSectionProps,
} from "../weeds_inventory";
import { fakeState } from "../../__test_support__/fake_state";
import {
  fakeWeed,
  fakeWebAppConfig,
  fakePointGroup,
} from "../../__test_support__/fake_state/resources";
import { SearchField } from "../../ui/search_field";
import { PointSortMenu } from "../../farm_designer/sort_options";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { BooleanSetting } from "../../session_keys";
import * as crud from "../../api/crud";
import { PanelSection } from "../../plants/plant_inventory";
import * as pointGroupActions from "../../point_groups/actions";
import { DEFAULT_CRITERIA } from "../../point_groups/criteria/interfaces";
import { weedsPanelState } from "../../__test_support__/panel_state";
import { Actions } from "../../constants";
import { Path } from "../../internal_urls";
import * as deletePoints from "../../api/delete_points";
import { renderWithContext } from "../../__test_support__/mount_with_context";
import { API } from "../../api";
import { ToggleButton } from "../../ui";
import {
  actRenderer,
  createRenderer,
  getRendererInstance,
  unmountRenderer,
} from "../../__test_support__/test_renderer";

const originalConfirm = window.confirm;
const wrappers: ReturnType<typeof createRenderer>[] = [];
const createWrapper = (element: React.ReactElement) => {
  const wrapper = createRenderer(element);
  wrappers.push(wrapper);
  return wrapper;
};
const getInstance = (wrapper: ReturnType<typeof createRenderer>) =>
  getRendererInstance<Weeds, WeedsProps>(wrapper, Weeds);

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  window.confirm = originalConfirm;
  API.setBaseUrl("");
  jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  jest.spyOn(crud, "save").mockImplementation(jest.fn());
  jest.spyOn(deletePoints, "deletePointsByIds")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  cleanup();
  while (wrappers.length > 0) {
    const wrapper = wrappers.pop();
    wrapper && unmountRenderer(wrapper);
  }
  window.confirm = originalConfirm;
});

describe("<Weeds> />", () => {
  let createGroupSpy: jest.SpyInstance;

  beforeEach(() => {
    createGroupSpy = jest.spyOn(pointGroupActions, "createGroup")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    createGroupSpy.mockRestore();
  });

  const fakeProps = (): WeedsProps => ({
    weeds: [],
    dispatch: jest.fn(),
    hoveredPoint: undefined,
    getConfigValue: jest.fn(),
    groups: [],
    allPoints: [],
    weedsPanelState: weedsPanelState(),
  });

  it("renders no points", () => {
    const { container } = render(<Weeds {...fakeProps()} />);
    expect(container.textContent).toContain("No weeds yet.");
  });

  it("renders pending weeds", () => {
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.plant_stage = "pending";
    p.weeds = [weed];
    const { container } = render(<Weeds {...p} />);
    expect(container.textContent).not.toContain("No pending weeds.");
  });

  it("renders no active weeds", () => {
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.plant_stage = "removed";
    p.weeds = [weed];
    const { container } = render(<Weeds {...p} />);
    expect(container.textContent).toContain("No active weeds.");
  });

  it("renders no removed weeds", () => {
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.plant_stage = "active";
    p.weeds = [weed];
    const { container } = render(<Weeds {...p} />);
    expect(container.textContent).toContain("No removed weeds.");
  });

  it("renders groups", () => {
    const p = fakeProps();
    const group1 = fakePointGroup();
    group1.body.name = "Weed Group";
    group1.body.criteria.string_eq = { pointer_type: ["Weed"] };
    const group2 = fakePointGroup();
    group2.body.name = "Plant Group";
    group2.body.criteria.string_eq = { pointer_type: ["Plant"] };
    p.groups = [group1, group2];
    const { container } = render(<Weeds {...p} />);
    expect(container.textContent).toContain("Groups (1)");
  });

  it("changes search term", () => {
    const wrapper = createWrapper(<Weeds {...fakeProps()} />);
    actRenderer(() => {
      wrapper.root.findByType(SearchField).props.onChange("0");
    });
    expect(getInstance(wrapper).state.searchTerm).toEqual("0");
  });

  it("closes section", () => {
    const p = fakeProps();
    const wrapper = createWrapper(<Weeds {...p} />);
    getInstance(wrapper).toggleOpen("pending")();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_WEEDS_PANEL_OPTION,
      payload: "pending",
    });
  });

  it("navigates to group", () => {
    const wrapper = createWrapper(<Weeds {...fakeProps()} />);
    const instance = getInstance(wrapper);
    instance.navigate = jest.fn();
    instance.navigateById(1)();
    expect(instance.navigate).toHaveBeenCalledWith(Path.groups(1));
  });

  it("adds new weed", () => {
    const wrapper = renderWithContext(<Weeds {...fakeProps()} />);
    fireEvent.click(wrapper.container.querySelector(".plus-weed") as Element);
    expect(mockNavigate).toHaveBeenCalledWith(Path.weeds("add"));
  });

  it("adds new group", () => {
    const wrapper = createWrapper(<Weeds {...fakeProps()} />);
    wrapper.root.findByType(PanelSection).props.addNew();
    expect(pointGroupActions.createGroup).toHaveBeenCalledWith({
      criteria: { ...DEFAULT_CRITERIA, string_eq: { pointer_type: ["Weed"] } },
      navigate: expect.anything(),
    });
  });

  it("changes sort term", () => {
    const wrapper = createWrapper(<Weeds {...fakeProps()} />);
    const menu = wrapper.root.findByType(SearchField).props.customLeftIcon;
    const menuWrapper = createWrapper(<div>{menu}</div>);
    expect(getInstance(wrapper).state.sortBy).toEqual("radius");
    expect(getInstance(wrapper).state.reverse).toEqual(true);
    actRenderer(() => {
      menuWrapper.root.findByType(PointSortMenu).props.onChange({
        sortBy: undefined,
        reverse: false,
      });
    });
    expect(getInstance(wrapper).state.sortBy).toEqual(undefined);
    expect(getInstance(wrapper).state.reverse).toEqual(false);
  });

  it("filters points", () => {
    const p = fakeProps();
    p.weeds = [fakeWeed(), fakeWeed()];
    p.weeds[0].body.name = "weed 0";
    p.weeds[0].body.plant_stage = "removed";
    p.weeds[1].body.name = "weed 1";
    const wrapper = createWrapper(<Weeds {...p} />);
    actRenderer(() => getInstance(wrapper).setState({ searchTerm: "0" }));
    const text = JSON.stringify(wrapper.toJSON()).toLowerCase();
    expect(text).toContain("weed 0");
    expect(text).not.toContain("weed 1");
  });
});

describe("mapStateToProps()", () => {
  it("returns value", () => {
    const state = fakeState();
    const config = fakeWebAppConfig();
    config.body.id = 1;
    config.body.show_weeds = true;
    state.resources = buildResourceIndex([config]);
    const props = mapStateToProps(state);
    expect(typeof props.getConfigValue).toEqual("function");
  });
});

describe("<WeedsSection />", () => {
  const fakeProps = (): WeedsSectionProps => ({
    category: "pending",
    sectionTitle: "title",
    emptyStateText: "none",
    open: false,
    hoveredPoint: undefined,
    clickOpen: jest.fn(),
    items: [fakeWeed(), fakeWeed(), fakeWeed()],
    dispatch: jest.fn(),
  });

  it("renders as closed", () => {
    const p = fakeProps();
    p.open = false;
    const { container } = render(<WeedsSection {...p} />);
    expect(container.innerHTML).toContain("fa-caret-down");
  });

  it("approves all", () => {
    const p = fakeProps();
    p.open = true;
    const { container } = render(<WeedsSection {...p} />);
    fireEvent.click(container.querySelector(".fb-button.green") as Element);
    expect(crud.edit).toHaveBeenCalledTimes(3);
    expect(crud.edit).toHaveBeenCalledWith(p.items[0], { plant_stage: "active" });
    expect(crud.save).toHaveBeenCalledTimes(3);
  });

  it("rejects all", () => {
    window.confirm = () => true;
    const p = fakeProps();
    p.open = true;
    const { container } = render(<WeedsSection {...p} />);
    fireEvent.click(container.querySelector(".fb-button.red") as Element);
    expect(deletePoints.deletePointsByIds).toHaveBeenCalledWith(
      "weeds",
      p.items.map(x => x.body.id),
    );
  });

  it("renders", () => {
    const p = fakeProps();
    p.open = true;
    const { container } = render(<WeedsSection {...p} />);
    ["(3)", "title", "all"].map(string =>
      expect(container.textContent?.toLowerCase()).toContain(string));
    expect(container.textContent?.toLowerCase()).not.toContain("none");
  });

  it("toggles layer", () => {
    const p = fakeProps();
    p.open = true;
    p.dispatch = jest.fn();
    p.layerValue = true;
    p.layerSetting = BooleanSetting.show_weeds;
    p.layerDisabled = false;
    const wrapper = createWrapper(<WeedsSection {...p} />);
    wrapper.root.findByType(ToggleButton).props.toggleAction({
      stopPropagation: jest.fn(),
    });
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("closes section", () => {
    const p = fakeProps();
    p.open = true;
    const { container } = render(<WeedsSection {...p} />);
    fireEvent.click(container.querySelector(".fa-caret-up") as Element);
    expect(p.clickOpen).toHaveBeenCalled();
  });
});
