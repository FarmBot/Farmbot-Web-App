jest.mock("../../ui/help", () => ({
  Help: ({ text }: { text: string }) => <p>{text}</p>,
}));

jest.mock("../../devices/actions", () => ({ move: jest.fn() }));

import React from "react";
import {
  PlantPanel, PlantPanelProps,
  EditDatePlantedProps, EditDatePlanted, EditPlantLocationProps,
  EditPlantLocation,
  EditPlantRadiusProps,
  EditPlantRadius,
  EditPlantDepthProps,
  EditPlantDepth,
} from "../plant_panel";
import { shallow, mount } from "enzyme";
import { FormattedPlantInfo } from "../map_state_to_props";
import { clickButton } from "../../__test_support__/helpers";
import moment from "moment";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import {
  fakeCurve, fakePlant, fakePoint,
} from "../../__test_support__/fake_state/resources";
import { tagAsSoilHeight } from "../../points/soil_height";
import { Path } from "../../internal_urls";
import { Actions } from "../../constants";
import { move } from "../../devices/actions";
import {
  fakeBotSize, fakeMovementState,
} from "../../__test_support__/fake_bot_data";
import { CurveType } from "../../curves/templates";

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
    info,
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
    const wrapper = mount(<PlantPanel {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("1 day old");
    expect(txt).toContain("meta value");
    expect(txt).not.toContain("gridId");
    const x = wrapper.find("input").at(1).props().value;
    const y = wrapper.find("input").at(2).props().value;
    expect(x).toEqual(12);
    expect(y).toEqual(34);
  });

  it("renders", () => {
    const p = fakeProps();
    const wrapper = mount(<PlantPanel {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("1 day old");
    expect(wrapper.find("button").length).toEqual(6);
  });

  it("renders plant stage", () => {
    const p = fakeProps();
    p.info.daysOld = undefined;
    p.info.plantStatus = "planned";
    const wrapper = mount(<PlantPanel {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).not.toContain("1 day old");
    expect(txt).toContain("planned");
  });

  it("renders in saved garden", () => {
    const p = fakeProps();
    p.inSavedGarden = true;
    const wrapper = mount(<PlantPanel {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).not.toContain("old");
    expect(wrapper.find("button").length).toEqual(5);
  });

  it("moves to plant location", () => {
    const wrapper = mount(<PlantPanel {...fakeProps()} />);
    clickButton(wrapper, 1, "go (x, y)");
    expect(move).toHaveBeenCalledWith({ x: 12, y: 34, z: 0 });
  });

  it("edits plant type", () => {
    const p = fakeProps();
    p.info.id = 1;
    const wrapper = mount(<PlantPanel {...p} />);
    wrapper.find(".fa-pencil").simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.cropSearch());
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PLANT_TYPE_CHANGE_ID, payload: 1,
    });
  });

  it("renders curves", () => {
    const p = fakeProps();
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
    const wrapper = mount(<PlantPanel {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("waterfake - 0l over 2 days");
  });

  it("changes curve", () => {
    const p = fakeProps();
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
    const wrapper = shallow(<PlantPanel {...p} />);
    wrapper.find("AllCurveInfo").simulate("change", 1, CurveType.water);
    expect(p.updatePlant).toHaveBeenCalledWith(info.uuid,
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
    const wrapper = shallow(<EditDatePlanted {...p} />);
    wrapper.find("BlurableInput").simulate("commit", {
      currentTarget: { value: "2010-10-10" }
    });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      planted_at: expect.stringContaining("Z")
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
    const wrapper = shallow(<EditPlantLocation {...p} />);
    wrapper.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: "100" }
    });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      x: 100
    });
  });

  it("renders soil height", () => {
    const p = fakeProps();
    const soilHeightPoint = fakePoint();
    tagAsSoilHeight(soilHeightPoint);
    p.soilHeightPoints = [soilHeightPoint];
    const wrapper = mount(<EditPlantLocation {...p} />);
    expect(wrapper.text().toLowerCase())
      .toContain("soil height at plant location: 0mm");
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
    const wrapper = shallow(<EditPlantRadius {...p} />);
    wrapper.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: "100" }
    });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      radius: 100
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
    const wrapper = shallow(<EditPlantDepth {...p} />);
    wrapper.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: "100" }
    });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      depth: 100
    });
  });
});
