jest.mock("axios", () => {
  return { default: { post: jest.fn(() => Promise.resolve()) } };
});

jest.mock("../actions", () => ({
  snapshotGarden: jest.fn(),
  newSavedGarden: jest.fn(),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { GardenSnapshotProps, GardenSnapshot } from "../garden_snapshot";
import { clickButton } from "../../../__test_support__/helpers";
import { error } from "farmbot-toastr";
import { snapshotGarden, newSavedGarden } from "../actions";
import { fakeSavedGarden } from "../../../__test_support__/fake_state/resources";

describe("<GardenSnapshot />", () => {
  const fakeProps = (): GardenSnapshotProps => ({
    plantsInGarden: true,
    currentSavedGarden: undefined,
    plantTemplates: [],
    dispatch: jest.fn(),
  });

  it("saves garden", () => {
    const wrapper = mount(<GardenSnapshot {...fakeProps()} />);
    clickButton(wrapper, 0, "snapshot current garden");
    expect(snapshotGarden).toHaveBeenCalledWith("");
  });

  it("doesn't snapshot saved garden", () => {
    const p = fakeProps();
    p.currentSavedGarden = fakeSavedGarden();
    const wrapper = mount(<GardenSnapshot {...p} />);
    clickButton(wrapper, 0, "snapshot current garden");
    expect(snapshotGarden).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("while saved garden is open"));
  });

  it("no garden to save", () => {
    const p = fakeProps();
    p.plantsInGarden = false;
    const wrapper = mount(<GardenSnapshot {...p} />);
    clickButton(wrapper, 0, "snapshot current garden");
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

  it("creates new garden", () => {
    const wrapper = shallow<GardenSnapshot>(<GardenSnapshot {...fakeProps()} />);
    wrapper.setState({ name: "new saved garden" });
    wrapper.find("button").last().simulate("click");
    expect(newSavedGarden).toHaveBeenCalledWith("new saved garden");
    expect(wrapper.instance().state.name).toEqual("");
  });
});
