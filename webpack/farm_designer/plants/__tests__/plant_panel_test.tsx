jest.mock("../../../history", () => ({ history: { push: jest.fn() } }));

import * as React from "react";
import {
  PlantPanel, PlantPanelProps, EditPlantStatus, EditPlantStatusProps
} from "../plant_panel";
import { shallow } from "enzyme";
import { FormattedPlantInfo } from "../map_state_to_props";
import { Actions } from "../../../constants";
import { clickButton } from "../../../__test_support__/helpers";
import { history } from "../../../history";

describe("<PlantPanel/>", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  const info: FormattedPlantInfo = {
    x: 12,
    y: 34,
    id: undefined,
    name: "tomato",
    uuid: "Plant.0.0",
    daysOld: 1,
    plantedAt: "2017-06-19T08:02:22.466-05:00",
    slug: "tomato",
    plantStatus: "planned",
  };

  const fakeProps = (): PlantPanelProps => {
    return {
      info,
      onDestroy: jest.fn(),
      updatePlant: jest.fn(),
      dispatch: jest.fn(),
    };
  };

  it("renders: editing", () => {
    const p = fakeProps();
    const wrapper = shallow(<PlantPanel {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("1 days old");
    expect(txt).toContain("(10, 30)");
  });

  it("calls destroy", () => {
    const p = fakeProps();
    const wrapper = shallow(<PlantPanel {...p} />);
    clickButton(wrapper, 1, "Delete");
    expect(p.onDestroy).toHaveBeenCalledWith("Plant.0.0");
  });

  it("renders", () => {
    const wrapper = shallow(<PlantPanel info={info} dispatch={jest.fn()} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("1 days old");
    expect(txt).toContain("(12, 34)");
  });

  it("enters select mode", () => {
    const wrapper = shallow(<PlantPanel info={info} dispatch={jest.fn()} />);
    clickButton(wrapper, 2, "Delete multiple");
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants/select");
  });

  it("navigates to 'move to' mode", () => {
    const dispatch = jest.fn();
    const wrapper = shallow(<PlantPanel info={info} dispatch={dispatch} />);
    clickButton(wrapper, 0, "Move FarmBot to this plant");
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants/move_to");
    expect(dispatch).toHaveBeenCalledWith({
      payload: { "x": 12, "y": 34, "z": undefined },
      type: Actions.CHOOSE_LOCATION
    });
  });
});

describe("<EditPlantStatus />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  const fakeProps = (): EditPlantStatusProps => {
    return {
      uuid: "Plant.0.0",
      plantStatus: "planned",
      updatePlant: jest.fn(),
    };
  };

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
