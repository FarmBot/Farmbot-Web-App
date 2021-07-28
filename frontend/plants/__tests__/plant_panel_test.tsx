jest.mock("../../history", () => ({ push: jest.fn() }));

import React from "react";
import {
  PlantPanel, PlantPanelProps,
  EditDatePlantedProps, EditDatePlanted, EditPlantLocationProps,
  EditPlantLocation,
  EditPlantRadiusProps,
  EditPlantRadius,
} from "../plant_panel";
import { shallow, mount } from "enzyme";
import { FormattedPlantInfo } from "../map_state_to_props";
import { clickButton } from "../../__test_support__/helpers";
import { push } from "../../history";
import moment from "moment";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { locationUrl } from "../../farm_designer/move_to";

describe("<PlantPanel/>", () => {
  const info: FormattedPlantInfo = {
    x: 12,
    y: 34,
    z: 0,
    radius: 25,
    id: undefined,
    name: "tomato",
    uuid: "Plant.0.0",
    daysOld: 1,
    plantedAt: moment("2017-06-19T08:02:22.466-05:00"),
    slug: "tomato",
    plantStatus: "planned",
  };

  const fakeProps = (): PlantPanelProps => ({
    info,
    onDestroy: jest.fn(),
    updatePlant: jest.fn(),
    dispatch: jest.fn(),
    inSavedGarden: false,
    timeSettings: fakeTimeSettings(),
    farmwareEnvs: [],
    soilHeightPoints: [],
  });

  it("renders: editing", () => {
    const p = fakeProps();
    p.info.meta = { meta_key: "meta value", gridId: "1", key: undefined };
    const wrapper = mount(<PlantPanel {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("1 days old");
    expect(txt).toContain("meta value");
    expect(txt).not.toContain("gridId");
    const x = wrapper.find("input").at(1).props().value;
    const y = wrapper.find("input").at(2).props().value;
    expect(x).toEqual(12);
    expect(y).toEqual(34);
  });

  it("calls destroy", () => {
    const p = fakeProps();
    p.info.meta = undefined;
    const wrapper = mount(<PlantPanel {...p} />);
    clickButton(wrapper, 2, "Delete");
    expect(p.onDestroy).toHaveBeenCalledWith("Plant.0.0");
  });

  it("renders", () => {
    const p = fakeProps();
    const wrapper = mount(<PlantPanel {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("1 days old");
    expect(wrapper.find("button").length).toEqual(4);
  });

  it("renders in saved garden", () => {
    const p = fakeProps();
    p.inSavedGarden = true;
    const wrapper = mount(<PlantPanel {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).not.toContain("days old");
    expect(wrapper.find("button").length).toEqual(3);
  });

  it("enters select mode", () => {
    const p = fakeProps();
    const wrapper = mount(<PlantPanel {...p} />);
    clickButton(wrapper, 3, "Delete multiple");
    expect(push).toHaveBeenCalledWith("/app/designer/plants/select");
  });

  it("navigates to 'move to' mode", () => {
    const wrapper = mount(<PlantPanel {...fakeProps()} />);
    clickButton(wrapper, 0, "Move FarmBot to this plant");
    expect(push).toHaveBeenCalledWith(locationUrl({ x: 12, y: 34, z: 0 }));
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
