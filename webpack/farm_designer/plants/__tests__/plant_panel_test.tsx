import * as React from "react";
import { PlantPanel, PlantPanelProps } from "../plant_panel";
import { shallow } from "enzyme";
import { FormattedPlantInfo } from "../map_state_to_props";

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
    wrapper.find("button").first().simulate("click");
    expect(p.onDestroy).toHaveBeenCalledWith("Plant.0.0");
  });

  it("changes stage to planted", () => {
    const p = fakeProps();
    const wrapper = shallow(<PlantPanel {...p} />);
    wrapper.find("FBSelect").simulate("change", { value: "planted" });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      plant_stage: "planted",
      planted_at: expect.stringContaining("Z")
    });
  });

  it("changes stage to planned", () => {
    const p = fakeProps();
    const wrapper = shallow(<PlantPanel {...p} />);
    wrapper.find("FBSelect").simulate("change", { value: "planned" });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      plant_stage: "planned",
      planted_at: undefined
    });
  });

  it("renders", () => {
    const wrapper = shallow(<PlantPanel info={info} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("1 days old");
    expect(txt).toContain("(12, 34)");
  });
});
