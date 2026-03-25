import React from "react";
import { render } from "@testing-library/react";
import * as designerPanel from "../../../farm_designer/designer_panel";
import * as activeFarmware from "../../set_active_farmware_by_name";
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

let designerPanelSpy: jest.SpyInstance;
let designerPanelTopSpy: jest.SpyInstance;
let designerPanelContentSpy: jest.SpyInstance;
let activeFarmwareSpy: jest.SpyInstance;

beforeEach(() => {
  designerPanelSpy = jest.spyOn(designerPanel, "DesignerPanel")
    .mockImplementation(((props: React.PropsWithChildren) =>
      <div className={"designer-panel"}>{props.children}</div>) as never);
  designerPanelTopSpy = jest.spyOn(designerPanel, "DesignerPanelTop")
    .mockImplementation(((props: React.PropsWithChildren) =>
      <div className={"designer-panel-top"}>{props.children}</div>) as never);
  designerPanelContentSpy = jest.spyOn(designerPanel, "DesignerPanelContent")
    .mockImplementation(((props: React.PropsWithChildren) =>
      <div className={"designer-panel-content"}>{props.children}</div>) as never);
  activeFarmwareSpy = jest.spyOn(activeFarmware, "setActiveFarmwareByName")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  designerPanelSpy.mockRestore();
  designerPanelTopSpy.mockRestore();
  designerPanelContentSpy.mockRestore();
  activeFarmwareSpy.mockRestore();
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
    const { container } = render(<DesignerFarmwareInfo {...fakeProps()} />);
    expect(container.querySelectorAll(".designer-panel").length).toEqual(1);
    const text = (container.textContent || "").toLowerCase();
    const hasEmptyStateCopy = text.includes("no farmware selected")
      || text.includes("pending installation");
    expect(hasEmptyStateCopy).toBeTruthy();
  });

  it("renders farmware info panel", () => {
    const p = fakeProps();
    p.farmwares = fakeFarmwares();
    p.currentFarmware = Object.keys(p.farmwares)[0];
    const { container } = render(<DesignerFarmwareInfo {...p} />);
    expect(container.querySelectorAll(".designer-panel").length).toEqual(1);
    const text = (container.textContent || "").toLowerCase();
    expect(text).toContain("description");
    expect(text).toContain("version");
    expect(text).toContain("0.0.0");
  });

  it("renders farmware installation info panel", () => {
    const p = fakeProps();
    const farmware = fakeFarmware();
    const farmwareInstallation = fakeFarmwareInstallation();
    farmwareInstallation.body.package = "My New Farmware";
    p.taggedFarmwareInstallations = [farmwareInstallation];
    p.currentFarmware = farmwareInstallation.body.package;
    p.farmwares = { [farmwareInstallation.body.package]: farmware };
    const { container } = render(<DesignerFarmwareInfo {...p} />);
    expect(container.querySelectorAll(".designer-panel").length).toEqual(1);
    const text = (container.textContent || "").toLowerCase();
    expect(text).toContain("description");
    expect(text).toContain("version");
    expect(text).toContain("0.0.0");
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
