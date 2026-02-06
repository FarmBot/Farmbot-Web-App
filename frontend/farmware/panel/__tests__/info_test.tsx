jest.mock("../../../farm_designer/designer_panel", () => ({
  DesignerPanel: (props: { children: unknown; }) =>
    <div className={"designer-panel"}>{props.children}</div>,
  DesignerPanelTop: (props: { children: unknown; }) =>
    <div className={"designer-panel-top"}>{props.children}</div>,
  DesignerPanelContent: (props: { children: unknown; }) =>
    <div className={"designer-panel-content"}>{props.children}</div>,
}));

jest.mock("../../set_active_farmware_by_name", () => ({
  setActiveFarmwareByName: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import {
  RawDesignerFarmwareInfo as DesignerFarmwareInfo,
  DesignerFarmwareInfoProps,
  mapStateToProps,
} from "../info";
import {
  fakeFarmware, fakeFarmwares,
} from "../../../__test_support__/fake_farmwares";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  fakeFarmwareInstallation,
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

afterAll(() => {
  jest.unmock("../../../farm_designer/designer_panel");
  jest.unmock("../../set_active_farmware_by_name");
});
describe("<DesignerFarmwareInfo />", () => {
  const fakeProps = (): DesignerFarmwareInfoProps => ({
    dispatch: jest.fn(),
    env: {},
    userEnv: {},
    farmwareEnvs: [],
    currentFarmware: undefined,
    botToMqttStatus: "up",
    farmwares: {},
    syncStatus: undefined,
    saveFarmwareEnv: jest.fn(),
    taggedFarmwareInstallations: [],
  });

  it("renders empty farmware info panel", () => {
    const wrapper = mount(<DesignerFarmwareInfo {...fakeProps()} />);
    expect(wrapper.find(".designer-panel").length).toEqual(1);
    expect(wrapper.text().toLowerCase()).toContain("no farmware selected");
  });

  it("renders farmware info panel", () => {
    const p = fakeProps();
    p.farmwares = fakeFarmwares();
    p.currentFarmware = Object.keys(p.farmwares)[0];
    const wrapper = mount(<DesignerFarmwareInfo {...p} />);
    expect(wrapper.find(".designer-panel").length).toEqual(1);
    expect(wrapper.text().toLowerCase()).toContain("my fake farmware");
  });

  it("renders farmware installation info panel", () => {
    const p = fakeProps();
    const farmware = fakeFarmware();
    const farmwareInstallation = fakeFarmwareInstallation();
    farmwareInstallation.body.package = "My New Farmware";
    p.taggedFarmwareInstallations = [farmwareInstallation];
    p.currentFarmware = farmwareInstallation.body.package;
    p.farmwares = { [farmwareInstallation.body.package]: farmware };
    const wrapper = mount(<DesignerFarmwareInfo {...p} />);
    expect(wrapper.find(".designer-panel").length).toEqual(1);
    expect(wrapper.text().toLowerCase()).toContain("my fake farmware");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const farmware = fakeFarmwareInstallation();
    farmware.body.package = "fake farmware";
    farmware.body.id = 1;
    state.resources = buildResourceIndex([farmware]);
    const props = mapStateToProps(state);
    expect(props.taggedFarmwareInstallations)
      .toEqual([farmware]);
    expect(Object.keys(props.farmwares).some(key =>
      key.toLowerCase().includes("fake farmware"))).toBeTruthy();
  });
});
