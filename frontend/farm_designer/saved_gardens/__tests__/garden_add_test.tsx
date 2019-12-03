import * as React from "react";
import { mount } from "enzyme";
import { RawAddGarden as AddGarden, mapStateToProps } from "../garden_add";
import { GardenSnapshotProps } from "../garden_snapshot";
import { fakeState } from "../../../__test_support__/fake_state";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { fakeSavedGarden } from "../../../__test_support__/fake_state/resources";

describe("<AddGarden />", () => {
  const fakeProps = (): GardenSnapshotProps => ({
    currentSavedGarden: undefined,
    plantTemplates: [],
    dispatch: jest.fn(),
  });

  it("renders add garden panel", () => {
    const wrapper = mount(<AddGarden {...fakeProps()} />);
    expect(wrapper.text()).toContain("create new garden");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    expect(props.currentSavedGarden).toEqual(undefined);
  });

  it("finds saved garden", () => {
    const state = fakeState();
    const savedGarden = fakeSavedGarden();
    state.resources = buildResourceIndex([savedGarden]);
    state.resources.consumers.farm_designer.openedSavedGarden = savedGarden.uuid;
    const props = mapStateToProps(state);
    expect(props.currentSavedGarden).toEqual(savedGarden);
  });
});
