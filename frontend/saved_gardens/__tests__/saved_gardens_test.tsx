import React from "react";
import { mount, shallow } from "enzyme";
import {
  RawSavedGardens as SavedGardens, mapStateToProps, SavedGardenHUD,
} from "../saved_gardens";
import {
  fakePlant, fakePlantTemplate, fakeSavedGarden,
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { SavedGardensProps } from "../interfaces";
import * as savedGardenActions from "../actions";
import { Actions } from "../../constants";
import { SearchField } from "../../ui/search_field";
import { Path } from "../../internal_urls";
import * as crud from "../../api/crud";

let editSpy: jest.SpyInstance;
let snapshotGardenSpy: jest.SpyInstance;
let applyGardenSpy: jest.SpyInstance;
let destroySavedGardenSpy: jest.SpyInstance;
let openOrCloseGardenSpy: jest.SpyInstance;
let closeSavedGardenSpy: jest.SpyInstance;

beforeEach(() => {
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  snapshotGardenSpy = jest.spyOn(savedGardenActions, "snapshotGarden")
    .mockImplementation(jest.fn());
  applyGardenSpy = jest.spyOn(savedGardenActions, "applyGarden")
    .mockImplementation(jest.fn());
  destroySavedGardenSpy = jest.spyOn(savedGardenActions, "destroySavedGarden")
    .mockImplementation(jest.fn());
  openOrCloseGardenSpy = jest.spyOn(savedGardenActions, "openOrCloseGarden")
    .mockImplementation(jest.fn());
  closeSavedGardenSpy = jest.spyOn(savedGardenActions, "closeSavedGarden")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  editSpy.mockRestore();
  snapshotGardenSpy.mockRestore();
  applyGardenSpy.mockRestore();
  destroySavedGardenSpy.mockRestore();
  openOrCloseGardenSpy.mockRestore();
  closeSavedGardenSpy.mockRestore();
});

describe("<SavedGardens />", () => {
  const fakeProps = (): SavedGardensProps => ({
    dispatch: jest.fn(),
    plantPointerCount: 1,
    savedGardens: [fakeSavedGarden()],
    plantTemplates: [fakePlantTemplate(), fakePlantTemplate()],
    openedSavedGarden: undefined,
  });

  it("renders saved gardens", () => {
    const p = fakeProps();
    p.plantTemplates[0].body.saved_garden_id = p.savedGardens[0].body.id || 0;
    p.plantTemplates[1].body.saved_garden_id = p.savedGardens[0].body.id || 0;
    const wrapper = mount(<SavedGardens {...p} />);
    ["saved garden 1", "2 plants"].map(string =>
      expect(wrapper.html().toLowerCase()).toContain(string));
  });

  it("has no saved gardens yet", () => {
    const p = fakeProps();
    p.savedGardens = [];
    const wrapper = mount(<SavedGardens {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("no saved gardens yet");
  });

  it("changes search term", () => {
    const wrapper = shallow<SavedGardens>(<SavedGardens {...fakeProps()} />);
    expect(wrapper.state().searchTerm).toEqual("");
    wrapper.find(SearchField).simulate("change", "spring");
    expect(wrapper.state().searchTerm).toEqual("spring");
  });

  it("shows filtered gardens", () => {
    const p = fakeProps();
    p.savedGardens = [fakeSavedGarden(), fakeSavedGarden()];
    p.savedGardens[0].body.name = "winter";
    p.savedGardens[1].body.name = "spring";
    const wrapper = mount(<SavedGardens {...p} />);
    wrapper.setState({ searchTerm: "winter" });
    expect(wrapper.text()).toContain("winter");
    expect(wrapper.text()).not.toContain("spring");
  });

  it("shows when garden is open", () => {
    const p = fakeProps();
    p.savedGardens = [fakeSavedGarden(), fakeSavedGarden()];
    p.openedSavedGarden = p.savedGardens[0].body.id;
    const wrapper = mount(<SavedGardens {...p} />);
    expect(wrapper.html()).toContain("selected");
  });
});

describe("mapStateToProps()", () => {
  it("has no plants in garden", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    const result = mapStateToProps(state);
    expect(result.plantPointerCount).toEqual(0);
  });

  it("has plants in garden", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakePlant()]);
    const result = mapStateToProps(state);
    expect(result.plantPointerCount).toBeGreaterThan(0);
  });
});

describe("<SavedGardenHUD />", () => {
  it("renders", () => {
    const wrapper = mount(<SavedGardenHUD dispatch={jest.fn()} />);
    ["viewing saved garden", "edit", "exit"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("navigates to plants", () => {
    const dispatch = jest.fn();
    const wrapper = mount(<SavedGardenHUD dispatch={dispatch} />);
    wrapper.find("button")
      .filterWhere(node => node.text().toLowerCase() == "edit")
      .first()
      .simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants());
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_POINT,
      payload: undefined
    });
  });

  it("exits garden", () => {
    const wrapper = mount(<SavedGardenHUD dispatch={jest.fn()} />);
    wrapper.find("button")
      .filterWhere(node => node.text().toLowerCase() == "exit")
      .first()
      .simulate("click");
    expect(savedGardenActions.closeSavedGarden).toHaveBeenCalled();
  });
});
