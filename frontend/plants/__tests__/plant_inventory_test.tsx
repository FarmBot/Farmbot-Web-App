let mockValue: number | boolean = 0;

import React from "react";
import {
  RawPlants as Plants,
  PlantInventoryProps,
  mapStateToProps,
  PanelSection,
  PanelSectionProps,
} from "../plant_inventory";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  fakePlant,
  fakePointGroup,
  fakeSavedGarden,
  fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import { Actions } from "../../constants";
import * as pointGroupActions from "../../point_groups/actions";
import { DEFAULT_CRITERIA } from "../../point_groups/criteria/interfaces";
import * as deletePointsApi from "../../api/delete_points";
import { Panel } from "../../farm_designer/panel_header";
import { plantsPanelState } from "../../__test_support__/panel_state";
import { Path } from "../../internal_urls";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import * as configStorageActions from "../../config_storage/actions";
import { NumericSetting } from "../../session_keys";
import * as popover from "../../ui/popover";
import { NavigationContext } from "../../routes_helpers";
import { WebAppNumberSetting } from "../../settings/farm_designer_settings";
import { WebAppNumberSettingProps } from "../../settings/interfaces";

const findElement = (
  node: unknown,
  predicate: (element: React.ReactElement) => boolean,
): React.ReactElement | undefined => {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findElement(item, predicate);
      if (found) { return found; }
    }
    return undefined;
  }

  if (!React.isValidElement(node)) { return undefined; }
  if (predicate(node)) { return node; }

  for (const value of Object.values(node.props || {})) {
    const found = findElement(value, predicate);
    if (found) { return found; }
  }

  return undefined;
};

describe("<PlantInventory />", () => {
  let createGroupSpy: jest.SpyInstance;
  let deletePointsSpy: jest.SpyInstance;
  let setWebAppConfigValueSpy: jest.SpyInstance;
  let getWebAppConfigValueSpy: jest.SpyInstance;
  let popoverSpy: jest.SpyInstance;

  beforeEach(() => {
    popoverSpy = jest.spyOn(popover, "Popover")
      .mockImplementation(({ target, content }: popover.PopoverProps) =>
        <div>{target}{content}</div>);
    createGroupSpy = jest.spyOn(pointGroupActions, "createGroup")
      .mockImplementation(jest.fn());
    deletePointsSpy = jest.spyOn(deletePointsApi, "deletePoints")
      .mockImplementation(jest.fn());
    setWebAppConfigValueSpy = jest.spyOn(configStorageActions,
      "setWebAppConfigValue").mockImplementation(jest.fn());
    getWebAppConfigValueSpy = jest.spyOn(configStorageActions, "getWebAppConfigValue")
      .mockImplementation((getState: Function) => {
        getState();
        return () => mockValue;
      });
  });

  afterEach(() => {
    popoverSpy.mockRestore();
    createGroupSpy.mockRestore();
    deletePointsSpy.mockRestore();
    setWebAppConfigValueSpy.mockRestore();
    getWebAppConfigValueSpy.mockRestore();
  });

  const fakeProps = (): PlantInventoryProps => ({
    plants: [fakePlant()],
    dispatch: jest.fn(),
    hoveredPlantListItem: undefined,
    groups: [],
    allPoints: [],
    savedGardens: [],
    plantTemplates: [],
    plantPointerCount: 0,
    openedSavedGarden: undefined,
    plantsPanelState: plantsPanelState(),
    getConfigValue: () => 0,
  });

  it("renders", () => {
    const { container } = render(<Plants {...fakeProps()} />);
    expect(container.textContent).toContain("Strawberry Plant 1");
    expect(container.textContent).toContain("planned");
    expect(screen.getByPlaceholderText("Search your plants..."))
      .toBeInTheDocument();
  });

  it("changes number setting", () => {
    mockValue = 0;
    const p = fakeProps();
    const rendered = new Plants(p).render();
    const setting = findElement(
      rendered,
      element => element.type === WebAppNumberSetting,
    );
    if (!setting) {
      throw new Error("Expected default plant depth setting control");
    }
    const blurableInput = WebAppNumberSetting(
      setting.props as WebAppNumberSettingProps);
    blurableInput.props.onCommit({
      currentTarget: { value: "100" },
    });
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      NumericSetting.default_plant_depth,
      100);
  });

  it("renders groups", () => {
    const p = fakeProps();
    const group1 = fakePointGroup();
    group1.body.name = "Plant Group";
    group1.body.criteria.string_eq = { pointer_type: ["Plant"] };
    const group2 = fakePointGroup();
    group2.body.name = "Weed Group";
    group2.body.criteria.string_eq = { pointer_type: ["Weed"] };
    const group3 = fakePointGroup();
    group3.body.name = "Weed Group";
    group3.body.criteria.string_eq = {};
    p.groups = [group1, group2, group3];
    render(<Plants {...p} />);
    expect(screen.getByText("Plant Groups (1)")).toBeInTheDocument();
  });

  it("renders saved gardens", () => {
    const p = fakeProps();
    const savedGarden = fakeSavedGarden();
    savedGarden.body.name = "Saved Garden";
    p.savedGardens = [savedGarden];
    render(<Plants {...p} />);
    expect(screen.getByText("Gardens (1)")).toBeInTheDocument();
  });

  it("toggles section", () => {
    const p = fakeProps();
    render(<Plants {...p} />);
    fireEvent.click(screen.getByText("Plant Groups (0)"));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_PLANTS_PANEL_OPTION,
      payload: "groups",
    });
  });

  it("navigates to group", () => {
    const instance = new Plants(fakeProps());
    instance.context = jest.fn();
    instance.navigateById(1)();
    expect(instance.context).toHaveBeenCalledWith(Path.groups(1));
  });

  it("adds new group", () => {
    const p = fakeProps();
    p.plantsPanelState.groups = true;
    const { container } = render(<Plants {...p} />);
    fireEvent.click(container.querySelector(".plus-group") as Element);
    expect(pointGroupActions.createGroup).toHaveBeenCalledWith({
      criteria: {
        ...DEFAULT_CRITERIA,
        string_eq: { pointer_type: ["Plant"] },
      },
      navigate: expect.anything(),
    });
  });

  it("adds new saved garden", () => {
    const p = fakeProps();
    p.plantsPanelState.savedGardens = true;
    const navigate = jest.fn();
    const { container } = render(
      <NavigationContext.Provider value={navigate}>
        <Plants {...p} />
      </NavigationContext.Provider>,
    );
    fireEvent.click(container.querySelector(".plus-saved-garden") as Element);
    expect(navigate).toHaveBeenCalledWith(Path.savedGardens("add"));
  });

  it("adds new plant", () => {
    const navigate = jest.fn();
    const { container } = render(
      <NavigationContext.Provider value={navigate}>
        <Plants {...fakeProps()} />
      </NavigationContext.Provider>,
    );
    fireEvent.click(container.querySelector(".plus-plant") as Element);
    expect(navigate).toHaveBeenCalledWith(Path.cropSearch());
  });

  it("deletes all plants", () => {
    window.confirm = jest.fn(() => true);
    const p = fakeProps();
    p.plantsPanelState.plants = true;
    render(<Plants {...p} />);
    const deleteAll = screen.getByText("delete all");
    expect(deleteAll).toBeInTheDocument();
    fireEvent.click(deleteAll);
    expect(deletePointsSpy)
      .toHaveBeenCalledWith("plants", { pointer_type: "Plant" });
  });

  it("doesn't show delete all button", () => {
    window.confirm = jest.fn(() => true);
    const p = fakeProps();
    p.plantsPanelState.plants = true;
    p.openedSavedGarden = 1;
    render(<Plants {...p} />);
    expect(screen.queryByText("delete all")).not.toBeInTheDocument();
  });

  it("has link to crops", () => {
    const { container } = render(<Plants {...fakeProps()} />);
    expect(container.querySelector(".plus-plant .fa-plus")).toBeTruthy();
  });

  it("changes search term", () => {
    render(<Plants {...fakeProps()} />);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const input = screen.getByPlaceholderText(
      "Search your plants...",
    ) as HTMLInputElement;
    expect(input.value).toEqual("");
    fireEvent.change(input, { target: { value: "mint" } });
    expect(input.value).toEqual("mint");
  });

  it("displays no results state", () => {
    render(<Plants {...fakeProps()} />);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    fireEvent.change(screen.getByPlaceholderText(
      "Search your plants...",
    ) as HTMLInputElement, { target: { value: "mint" } });
    expect(screen.getByText("No results in your garden")).toBeInTheDocument();
    expect(screen.getByText("search all crops?")).toBeInTheDocument();
  });

  it("navigates to crop search", () => {
    const p = fakeProps();
    const navigate = jest.fn();
    render(
      <NavigationContext.Provider value={navigate}>
        <Plants {...p} />
      </NavigationContext.Provider>,
    );
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    fireEvent.change(screen.getByPlaceholderText(
      "Search your plants...",
    ) as HTMLInputElement, { target: { value: "mint" } });
    fireEvent.click(screen.getByText("search all crops?"));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SEARCH_QUERY_CHANGE,
      payload: "mint",
    });
    expect(navigate).toHaveBeenCalledWith(Path.cropSearch());
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    mockValue = false;
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.show_plants = false;
    state.resources = buildResourceIndex([webAppConfig]);
    state.resources.consumers.farm_designer.hoveredPlantListItem = "uuid";
    const result = mapStateToProps(state);
    expect(result.hoveredPlantListItem).toEqual("uuid");
    expect(result.getConfigValue("show_plants")).toEqual(false);
  });
});

describe("<PanelSection />", () => {
  const fakeProps = (): PanelSectionProps => ({
    panel: Panel.Plants,
    isOpen: true,
    toggleOpen: jest.fn(),
    itemCount: 1,
    title: "title",
    addNew: jest.fn(),
    addTitle: "add",
    addClassName: "plus",
    children: <p>text</p>,
  });

  it("renders open", () => {
    render(<PanelSection {...fakeProps()} />);
    expect(screen.getByText("text")).toBeInTheDocument();
  });

  it("calls add", () => {
    const p = fakeProps();
    const { container } = render(<PanelSection {...p} />);
    fireEvent.click(container.querySelector(".fb-button") as Element);
    expect(p.addNew).toHaveBeenCalled();
  });
});
