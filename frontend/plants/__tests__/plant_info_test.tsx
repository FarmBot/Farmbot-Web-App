import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { RawPlantInfo as PlantInfo } from "../plant_info";
import { fakePlant } from "../../__test_support__/fake_state/resources";
import { EditPlantInfoProps } from "../../farm_designer/interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import * as crud from "../../api/crud";
import { DesignerPanelHeader } from "../../farm_designer/designer_panel";
import {
  fakeBotSize,
  fakeMovementState,
} from "../../__test_support__/fake_bot_data";
import { Path } from "../../internal_urls";

beforeEach(() => {
  jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  jest.spyOn(crud, "save").mockImplementation(jest.fn());
  jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
});


describe("<PlantInfo />", () => {
  const fakeProps = (): EditPlantInfoProps => ({
    findPlant: fakePlant,
    dispatch: jest.fn(),
    openedSavedGarden: undefined,
    timeSettings: fakeTimeSettings(),
    getConfigValue: jest.fn(),
    farmwareEnvs: [],
    soilHeightPoints: [],
    arduinoBusy: false,
    currentBotLocation: { x: 0, y: 0, z: 0 },
    botOnline: true,
    movementState: fakeMovementState(),
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    botSize: fakeBotSize(),
    curves: [],
    plants: [],
  });

  const headerFromPanel = (
    panel: React.ReactElement<{ children?: React.ReactNode }>,
  ) => {
    const children = React.Children.toArray(panel.props.children);
    return children.find(child =>
      React.isValidElement(child)
      && child.type === DesignerPanelHeader) as React.ReactElement;
  };

  it("renders", () => {
    render(<PlantInfo {...fakeProps()} />);
    expect(screen.getByText(/Strawberry Plant 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Plant Type/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Strawberry" }))
      .toBeInTheDocument();
    const plannedButton = screen.queryByRole("button", { name: "Planned" });
    if (plannedButton) {
      expect(plannedButton).toBeInTheDocument();
    } else {
      expect(screen.getAllByText(/^planned$/i).length).toBeGreaterThan(0);
    }
    expect(screen.getByRole("button", { name: "GO (X, Y)" }))
      .toBeInTheDocument();
  });

  it("renders: no plant", () => {
    location.pathname = Path.mock(Path.plants("nope"));
    const p = fakeProps();
    p.findPlant = () => undefined;
    render(<PlantInfo {...p} />);
    expect(screen.getByText(/redirecting/i)).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants());
  });

  it("renders: no plant template", () => {
    location.pathname = Path.mock(Path.plantTemplates("nope"));
    const p = fakeProps();
    p.findPlant = () => undefined;
    render(<PlantInfo {...p} />);
    expect(screen.getByText(/redirecting/i)).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const p = fakeProps();
    p.findPlant = () => undefined;
    render(<PlantInfo {...p} />);
    expect(screen.getByText(/redirecting/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("has link to plants", () => {
    const p = fakeProps();
    p.openedSavedGarden = undefined;
    const { container } = render(<PlantInfo {...p} />);
    const backArrow = container.querySelector(".back-arrow");
    expect(backArrow).toBeTruthy();
    fireEvent.click(backArrow as Element);
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants());
  });

  it("gets plant id", () => {
    location.pathname = Path.mock(Path.plants(1));
    const p = fakeProps();
    p.openedSavedGarden = undefined;
    const instance = new PlantInfo(p);
    expect(instance.stringyID).toEqual("1");
  });

  it("gets template id", () => {
    location.pathname = Path.mock(Path.plantTemplates(2));
    const p = fakeProps();
    p.openedSavedGarden = 1;
    const instance = new PlantInfo(p);
    expect(instance.stringyID).toEqual("2");
  });

  it("handles missing plant id", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    p.openedSavedGarden = undefined;
    const instance = new PlantInfo(p);
    expect(instance.stringyID).toEqual("");
  });

  it("updates plant", () => {
    const instance = new PlantInfo(fakeProps());
    instance.updatePlant("uuid", {});
    expect(crud.edit).toHaveBeenCalled();
    expect(crud.save).toHaveBeenCalledWith("uuid");
  });

  it("handles missing plant", () => {
    const p = fakeProps();
    p.findPlant = jest.fn(() => undefined);
    const instance = new PlantInfo(p);
    instance.updatePlant("uuid", {});
    expect(crud.edit).not.toHaveBeenCalled();
  });

  it("saves", () => {
    location.pathname = Path.mock(Path.plants(1));
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.id = 1;
    p.findPlant = () => plant;
    const instance = new PlantInfo(p);
    const header = headerFromPanel(instance.default(plant));
    const onSave = (header.props as { onSave?: () => void }).onSave;
    onSave?.();
    expect(crud.save).toHaveBeenCalledWith(plant.uuid);
  });

  it("doesn't save", () => {
    location.pathname = Path.mock(Path.logs());
    const p = fakeProps();
    p.findPlant = () => undefined;
    const instance = new PlantInfo(p);
    const header = headerFromPanel(instance.fallback());
    const onSave = (header.props as { onSave?: () => void }).onSave;
    onSave?.();
    expect(crud.save).not.toHaveBeenCalled();
  });

  it("destroys plant", () => {
    const instance = new PlantInfo(fakeProps());
    instance.destroy("uuid")();
    expect(crud.destroy).toHaveBeenCalledWith("uuid", false);
  });

  it("force destroys plant", () => {
    const p = fakeProps();
    p.getConfigValue = jest.fn(() => false);
    const instance = new PlantInfo(p);
    instance.destroy("uuid")();
    expect(crud.destroy).toHaveBeenCalledWith("uuid", true);
  });
});
