jest.mock("../../../history", () => ({ history: { push: jest.fn() } }));

import * as React from "react";
import {
  PlantPanel, PlantPanelProps, EditPlantStatus, EditPlantStatusProps,
  EditDatePlantedProps, EditDatePlanted, EditPlantLocationProps,
  EditPlantLocation
} from "../plant_panel";
import { shallow, mount } from "enzyme";
import { FormattedPlantInfo } from "../map_state_to_props";
import { Actions } from "../../../constants";
import { clickButton } from "../../../__test_support__/helpers";
import { history } from "../../../history";
import moment from "moment";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";

describe("<PlantPanel/>", () => {
  const info: FormattedPlantInfo = {
    x: 12,
    y: 34,
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
  });

  it("renders: editing", () => {
    const p = fakeProps();
    const wrapper = mount(<PlantPanel {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("1 days old");
    const x = wrapper.find("input").at(1).props().value;
    const y = wrapper.find("input").at(2).props().value;
    expect(x).toEqual(12);
    expect(y).toEqual(34);
  });

  it("calls destroy", () => {
    const p = fakeProps();
    const wrapper = mount(<PlantPanel {...p} />);
    clickButton(wrapper, 2, "Delete");
    expect(p.onDestroy).toHaveBeenCalledWith("Plant.0.0");
  });

  it("renders", () => {
    const p = fakeProps();
    const wrapper = mount(<PlantPanel {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("1 days old");
    expect(txt).not.toContain("june");
    expect(wrapper.find("button").length).toEqual(4);
  });

  it("renders in saved garden", () => {
    const p = fakeProps();
    p.inSavedGarden = true;
    const wrapper = mount(<PlantPanel {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("june");
    expect(wrapper.find("button").length).toEqual(3);
  });

  it("enters select mode", () => {
    const p = fakeProps();
    const wrapper = mount(<PlantPanel {...p} />);
    clickButton(wrapper, 3, "Delete multiple");
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants/select");
  });

  it("navigates to 'move to' mode", async () => {
    const p = fakeProps();
    const innerDispatch = jest.fn();
    p.dispatch = jest.fn(x => x(innerDispatch));
    const wrapper = mount(<PlantPanel {...p} />);
    await clickButton(wrapper, 0, "Move FarmBot to this plant");
    expect(history.push).toHaveBeenCalledWith("/app/designer/move_to");
    expect(innerDispatch).toHaveBeenLastCalledWith({
      type: Actions.CHOOSE_LOCATION,
      payload: { x: 12, y: 34, z: undefined }
    });
  });
});

describe("<EditPlantStatus />", () => {
  const fakeProps = (): EditPlantStatusProps => ({
    uuid: "Plant.0.0",
    plantStatus: "planned",
    updatePlant: jest.fn(),
  });

  it("changes stage to planted", () => {
    const p = fakeProps();
    const wrapper = shallow(<EditPlantStatus {...p} />);
    wrapper.find("FBSelect").simulate("change", { value: "planted" });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      plant_stage: "planted",
      planted_at: expect.stringContaining("Z")
    });
  });

  it("changes stage to planned", () => {
    const p = fakeProps();
    const wrapper = shallow(<EditPlantStatus {...p} />);
    wrapper.find("FBSelect").simulate("change", { value: "planned" });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      plant_stage: "planned",
      planted_at: undefined
    });
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
    location: { x: 1, y: 2 },
    updatePlant: jest.fn(),
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
