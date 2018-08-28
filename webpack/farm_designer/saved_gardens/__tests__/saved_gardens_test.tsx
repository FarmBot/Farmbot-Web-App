jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

jest.mock("../../../history", () => ({ history: { push: jest.fn() } }));

jest.mock("../snapshot", () => ({
  snapshotGarden: jest.fn(),
}));

jest.mock("../apply_garden", () => ({
  applyGarden: jest.fn(),
}));

jest.mock("../../../api/crud", () => ({
  destroy: jest.fn(),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { snapshotGarden } from "../snapshot";
import {
  SavedGardens, SavedGardensProps, GardenSnapshot, GardenSnapshotProps,
  mapStateToProps, SavedGardensLink
} from "../saved_gardens";
import { error } from "farmbot-toastr";
import { clickButton } from "../../../__test_support__/helpers";
import {
  fakePlantTemplate, fakeSavedGarden
} from "../../../__test_support__/fake_state/resources";
import { applyGarden } from "../apply_garden";
import { destroy } from "../../../api/crud";
import { history } from "../../../history";
import { fakeState } from "../../../__test_support__/fake_state";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";

describe("<SavedGardens />", () => {
  const fakeProps = (): SavedGardensProps => ({
    dispatch: jest.fn(),
    plantsInGarden: true,
    savedGardens: [fakeSavedGarden()],
    plantTemplates: [fakePlantTemplate(), fakePlantTemplate()],
  });

  it("renders saved gardens", () => {
    const wrapper = mount(<SavedGardens {...fakeProps()} />);
    ["saved garden 1", "2", "apply"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("applies garden", () => {
    const p = fakeProps();
    p.plantsInGarden = false;
    const wrapper = mount(<SavedGardens {...p} />);
    clickButton(wrapper, 1, "apply");
    expect(applyGarden).toHaveBeenCalledWith(1);
  });

  it("plants still in garden", () => {
    const wrapper = mount(<SavedGardens {...fakeProps()} />);
    wrapper.find("button").first().simulate("click");
    clickButton(wrapper, 1, "apply");
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "Please clear current garden first"));
  });

  it("destroys garden", () => {
    const p = fakeProps();
    const wrapper = mount(<SavedGardens {...p} />);
    clickButton(wrapper, 2, "");
    expect(destroy).toHaveBeenCalledWith(p.savedGardens[0].uuid);
  });

  it("goes back", () => {
    const wrapper = mount(<SavedGardens {...fakeProps()} />);
    wrapper.find("i").first().simulate("click");
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants");
  });

  it("has no saved gardens yet", () => {
    const p = fakeProps();
    p.savedGardens = [];
    const wrapper = mount(<SavedGardens {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("no saved gardens yet");
  });
});

describe("<GardenSnapshot />", () => {
  const fakeProps = (): GardenSnapshotProps => ({
    plantsInGarden: true,
  });

  it("saves garden", () => {
    const wrapper = mount(<GardenSnapshot {...fakeProps()} />);
    clickButton(wrapper, 0, "snapshot");
    expect(snapshotGarden).toHaveBeenCalledWith(undefined);
  });

  it("no garden to save", () => {
    const p = fakeProps();
    p.plantsInGarden = false;
    const wrapper = mount(<GardenSnapshot {...p} />);
    clickButton(wrapper, 0, "snapshot");
    expect(snapshotGarden).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "No plants in garden"));
  });

  it("changes name", () => {
    const wrapper = shallow<GardenSnapshot>(<GardenSnapshot {...fakeProps()} />);
    wrapper.find("input").first().simulate("change", {
      currentTarget: { value: "new name" }
    });
    expect(wrapper.instance().state.name).toEqual("new name");
  });
});

describe("mapStateToProps()", () => {
  it("has no plants in garden", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    const result = mapStateToProps(state);
    expect(result.plantsInGarden).toEqual(false);
  });

  it("has plants in garden", () => {
    const result = mapStateToProps(fakeState());
    expect(result.plantsInGarden).toEqual(true);
  });
});

describe("<SavedGardensLink />", () => {
  it("opens saved garden panel", () => {
    localStorage.setItem("SAVE_MY_GARDEN", "certainly");
    const wrapper = shallow(<SavedGardensLink />);
    clickButton(wrapper, 0, "saved gardens");
    expect(history.push).toHaveBeenCalledWith(
      "/app/designer/plants/saved_gardens");
  });

  it("saved garden button hidden", () => {
    localStorage.removeItem("SAVE_MY_GARDEN");
    const wrapper = shallow(<SavedGardensLink />);
    const btn = wrapper.find("button").at(0);
    expect(btn.props().hidden).toEqual(true);
  });
});
