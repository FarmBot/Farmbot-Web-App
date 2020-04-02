jest.mock("../actions", () => ({
  snapshotGarden: jest.fn(),
  applyGarden: jest.fn(),
  destroySavedGarden: jest.fn(),
  openOrCloseGarden: jest.fn(),
  closeSavedGarden: jest.fn(),
}));

jest.mock("../../../history", () => ({
  history: { push: jest.fn() },
  getPathArray: () => [],
}));

jest.mock("../../../api/crud", () => ({ edit: jest.fn() }));

import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawSavedGardens as SavedGardens, mapStateToProps,
  SavedGardenHUD, savedGardenOpen,
} from "../saved_gardens";
import { clickButton } from "../../../__test_support__/helpers";
import {
  fakePlantTemplate, fakeSavedGarden,
} from "../../../__test_support__/fake_state/resources";
import { history } from "../../../history";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { SavedGardensProps } from "../interfaces";
import { closeSavedGarden } from "../actions";
import { Actions } from "../../../constants";

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
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "spring" } });
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
    p.openedSavedGarden = p.savedGardens[0].uuid;
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
    const result = mapStateToProps(fakeState());
    expect(result.plantPointerCount).toBeGreaterThan(0);
  });
});

describe("savedGardenOpen", () => {
  it("is open", () => {
    const result = savedGardenOpen(["", "", "", "gardens", "4", ""]);
    expect(result).toEqual(4);
  });
});

describe("<SavedGardenHUD />", () => {
  it("renders", () => {
    const wrapper = mount(<SavedGardenHUD dispatch={jest.fn()} />);
    ["viewing saved garden", "menu", "edit", "exit"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("opens menu", () => {
    const wrapper = mount(<SavedGardenHUD dispatch={jest.fn()} />);
    clickButton(wrapper, 0, "menu");
    expect(history.push).toHaveBeenCalledWith("/app/designer/gardens");
  });

  it("navigates to plants", () => {
    const dispatch = jest.fn();
    const wrapper = mount(<SavedGardenHUD dispatch={dispatch} />);
    clickButton(wrapper, 1, "edit");
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants");
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_POINT,
      payload: undefined
    });
  });

  it("exits garden", () => {
    const wrapper = mount(<SavedGardenHUD dispatch={jest.fn()} />);
    clickButton(wrapper, 2, "exit");
    expect(closeSavedGarden).toHaveBeenCalled();
  });
});
