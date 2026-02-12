/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock("../../ui", () => {
  const React = require("react");
  const actual = jest.requireActual("../../ui");
  return {
    ...actual,
    BlurableInput: (props: any) => <input
      value={props.value}
      onChange={e => props.onCommit(e)} />,
    FBSelect: (props: any) => {
      const value = props.selectedItem ? String(props.selectedItem.value) : "";
      return <select
        className={"mock-fb-select"}
        value={value}
        onChange={e => {
          const nextValue = e.currentTarget.value;
          const selected = nextValue === ""
            ? props.list.find((item: any) => item.isNull)
            || props.list.find((item: any) => String(item.value) === "")
            : props.list.find((item: any) => String(item.value) === nextValue);
          selected && props.onChange(selected);
        }}>
        <option value={""} />
        {props.list.map((item: any, index: number) =>
          <option key={`${item.value}-${index}`} value={String(item.value)}>
            {item.label}
          </option>)}
      </select>;
    },
  };
});

import React from "react";
import {
  PlantPanel,
  PlantPanelProps,
  EditDatePlantedProps,
  EditDatePlanted,
  EditPlantLocationProps,
  EditPlantLocation,
  EditPlantRadiusProps,
  EditPlantRadius,
  EditPlantDepthProps,
  EditPlantDepth,
} from "../plant_panel";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormattedPlantInfo } from "../map_state_to_props";
import moment from "moment";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import {
  fakeCurve,
  fakePlant,
  fakePoint,
} from "../../__test_support__/fake_state/resources";
import { tagAsSoilHeight } from "../../points/soil_height";
import { Path } from "../../internal_urls";
import { Actions } from "../../constants";
import * as deviceActions from "../../devices/actions";
import {
  fakeBotSize,
  fakeMovementState,
} from "../../__test_support__/fake_bot_data";
import * as help from "../../ui/help";

let moveSpy: jest.SpyInstance;
let helpSpy: jest.SpyInstance;

beforeEach(() => {
  moveSpy = jest.spyOn(deviceActions, "move").mockImplementation(jest.fn());
  helpSpy = jest.spyOn(help, "Help").mockImplementation(
    jest.fn(({ text }: { text: string }) => <p>{text}</p>) as never);
});

afterEach(() => {
  moveSpy.mockRestore();
  helpSpy.mockRestore();
});

describe("<PlantPanel />", () => {
  const info: FormattedPlantInfo = {
    x: 12,
    y: 34,
    z: 0,
    radius: 25,
    depth: 0,
    id: undefined,
    name: "tomato",
    uuid: "Point.0.0",
    daysOld: 1,
    plantedAt: moment("2017-06-19T08:02:22.466-05:00"),
    slug: "tomato",
    plantStatus: "planned",
  };

  const fakeProps = (): PlantPanelProps => ({
    info: {
      ...info,
      plantedAt: info.plantedAt.clone(),
      meta: info.meta ? { ...info.meta } : undefined,
    },
    updatePlant: jest.fn(),
    dispatch: jest.fn(),
    inSavedGarden: false,
    timeSettings: fakeTimeSettings(),
    farmwareEnvs: [],
    soilHeightPoints: [],
    arduinoBusy: false,
    currentBotLocation: { x: 0, y: 0, z: 0 },
    botOnline: true,
    defaultAxes: "XY",
    movementState: fakeMovementState(),
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    botSize: fakeBotSize(),
    curves: [],
    plants: [],
  });

  it("renders: editing", () => {
    const p = fakeProps();
    p.info.meta = { meta_key: "meta value", gridId: "1", key: undefined };
    const { container } = render(<PlantPanel {...p} />);
    const txt = (container.textContent || "").toLowerCase();
    expect(txt).toContain("1 day old");
    expect(txt).toContain("meta value");
    expect(txt).not.toContain("gridid");
    const inputs = container.querySelectorAll("input");
    const x = (inputs[1]).value;
    const y = (inputs[2]).value;
    expect(x).toEqual("12");
    expect(y).toEqual("34");
  });

  it("renders", () => {
    render(<PlantPanel {...fakeProps()} />);
    expect(screen.getByText("1 day old")).toBeInTheDocument();
    expect(screen.getByTitle("GO (X, Y)")).toBeInTheDocument();
  });

  it("renders plant stage", () => {
    const p = fakeProps();
    p.info.daysOld = undefined;
    p.info.plantStatus = "planned";
    const { container } = render(<PlantPanel {...p} />);
    const txt = (container.textContent || "").toLowerCase();
    expect(txt).not.toContain("1 day old");
    expect(txt).toContain("planned");
  });

  it("renders in saved garden", () => {
    const p = fakeProps();
    p.inSavedGarden = true;
    const { container } = render(<PlantPanel {...p} />);
    const txt = (container.textContent || "").toLowerCase();
    expect(txt).not.toContain("old");
    expect(screen.getByTitle("GO (X, Y)")).toBeInTheDocument();
  });

  it("moves to plant location", () => {
    render(<PlantPanel {...fakeProps()} />);
    fireEvent.click(screen.getByTitle("GO (X, Y)"));
    expect(deviceActions.move).toHaveBeenCalledWith({ x: 12, y: 34, z: 0 });
  });

  it("edits plant type", () => {
    const p = fakeProps();
    p.info.id = 1;
    const { container } = render(<PlantPanel {...p} />);
    fireEvent.click(container.querySelector(".fa-pencil") as Element);
    expect(mockNavigate).toHaveBeenCalledWith(Path.cropSearch());
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PLANT_TYPE_CHANGE_ID,
      payload: 1,
    });
  });

  it("renders curves", () => {
    const p = fakeProps();
    p.inSavedGarden = true;
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curves = [curve];
    const plant = fakePlant();
    plant.body.openfarm_slug = "mint";
    plant.body.water_curve_id = 1;
    p.plants = [plant];
    p.info.water_curve_id = 1;
    p.info.uuid = "Point.0.0";
    const { container } = render(<PlantPanel {...p} />);
    expect((container.textContent || "").toLowerCase())
      .toContain("fake - 0l over 2 days");
  });

  it("changes curve", () => {
    const p = fakeProps();
    p.inSavedGarden = true;
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curves = [curve];
    const plant = fakePlant();
    plant.body.openfarm_slug = "mint";
    plant.body.water_curve_id = 1;
    p.plants = [plant];
    p.info.water_curve_id = 1;
    p.info.uuid = "Point.0.0";
    const { container } = render(<PlantPanel {...p} />);
    const firstCurveSelect = container.querySelector(".mock-fb-select");
    fireEvent.change(firstCurveSelect as Element, { target: { value: "1" } });
    expect(p.updatePlant).toHaveBeenCalledWith(p.info.uuid,
      { water_curve_id: 1 });
  });
});

describe("<EditDatePlanted />", () => {
  const fakeProps = (): EditDatePlantedProps => ({
    uuid: "Plant.0.0",
    datePlanted: moment("2017-06-19T08:02:22.466-05:00"),
    updatePlant: jest.fn(),
    timeSettings: fakeTimeSettings(),
  });

  it("changes date planted", () => {
    const p = fakeProps();
    render(<EditDatePlanted {...p} />);
    fireEvent.change(screen.getByDisplayValue("2017-06-19"),
      { target: { value: "2010-10-10" } });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      planted_at: expect.stringContaining("Z"),
    });
  });
});

describe("<EditPlantLocation />", () => {
  const fakeProps = (): EditPlantLocationProps => ({
    uuid: "Plant.0.0",
    plantLocation: { x: 1, y: 2, z: 0 },
    updatePlant: jest.fn(),
    farmwareEnvs: [],
    soilHeightPoints: [],
  });

  it("changes location", () => {
    const p = fakeProps();
    const { container } = render(<EditPlantLocation {...p} />);
    const xInput = container.querySelectorAll("input")[0];
    fireEvent.change(xInput, { target: { value: "100" } });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      x: 100,
    });
  });

  it("renders soil height", () => {
    const p = fakeProps();
    const soilHeightPoint = fakePoint();
    tagAsSoilHeight(soilHeightPoint);
    p.soilHeightPoints = [soilHeightPoint];
    render(<EditPlantLocation {...p} />);
    expect(screen.getByText(/soil height at plant location:/i))
      .toBeInTheDocument();
  });
});

describe("<EditPlantRadius />", () => {
  const fakeProps = (): EditPlantRadiusProps => ({
    uuid: "Plant.0.0",
    radius: 10,
    updatePlant: jest.fn(),
  });

  it("changes location", () => {
    const p = fakeProps();
    render(<EditPlantRadius {...p} />);
    fireEvent.change(screen.getByDisplayValue("10"),
      { target: { value: "100" } });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      radius: 100,
    });
  });
});

describe("<EditPlantDepth />", () => {
  const fakeProps = (): EditPlantDepthProps => ({
    uuid: "Plant.0.0",
    depth: 10,
    updatePlant: jest.fn(),
  });

  it("changes location", () => {
    const p = fakeProps();
    render(<EditPlantDepth {...p} />);
    fireEvent.change(screen.getByDisplayValue("10"),
      { target: { value: "100" } });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      depth: 100,
    });
  });
});

afterAll(() => {
  jest.unmock("../../ui");
});
