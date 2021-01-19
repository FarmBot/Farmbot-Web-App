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
    ["no farmware selected", "run"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("renders farmware info panel", () => {
    const p = fakeProps();
    p.farmwares = fakeFarmwares();
    p.currentFarmware = Object.keys(p.farmwares)[0];
    const wrapper = mount(<DesignerFarmwareInfo {...p} />);
    ["my fake farmware", "does things", "run"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
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
    ["my fake farmware", "does things", "run"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
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
    expect(props.farmwares).toEqual({
      "fake farmware (pending install...)": expect.any(Object)
    });
  });
});
