let mockIsDesktop = false;
let mockIsMobile = false;
jest.mock("../../screen_size", () => ({
  isDesktop: () => mockIsDesktop,
  isMobile: () => mockIsMobile,
}));

import React from "react";
import { mount } from "enzyme";
import { GardenModelProps, GardenModel } from "../garden_model";
import { clone } from "lodash";
import { INITIAL } from "../config";
import { render, screen } from "@testing-library/react";
import {
  fakePlant, fakePoint, fakeWeed,
} from "../../__test_support__/fake_state/resources";
import { fakeAddPlantProps } from "../../__test_support__/fake_props";
import { ASSETS } from "../constants";
import { Path } from "../../internal_urls";
import { fakeDrawnPoint } from "../../__test_support__/fake_designer_state";
import { convertPlants } from "../../farm_designer/three_d_garden_map";

describe("<GardenModel />", () => {
  beforeEach(() => {
    mockIsMobile = false;
  });

  const fakeProps = (): GardenModelProps => ({
    config: clone(INITIAL),
    activeFocus: "",
    setActiveFocus: jest.fn(),
    addPlantProps: fakeAddPlantProps(),
    threeDPlants: [],
  });

  it("renders", () => {
    const { container } = render(<GardenModel {...fakeProps()} />);
    expect(container).toContainHTML("zoom-beacons");
    expect(container).not.toContainHTML("stats");
    expect(container).toContainHTML("darkgreen");
  });

  it("renders top down view", () => {
    mockIsMobile = true;
    const p = fakeProps();
    const addPlantProps = fakeAddPlantProps();
    addPlantProps.designer.threeDTopDownView = true;
    p.addPlantProps = addPlantProps;
    const { container } = render(<GardenModel {...p} />);
    expect(container).toContainHTML("darkgreen");
  });

  it("renders no user plants", () => {
    const p = fakeProps();
    p.threeDPlants = convertPlants(p.config, []);
    render(<GardenModel {...p} />);
    const plantLabels = screen.queryAllByText("Beet");
    expect(plantLabels.length).toEqual(0);
  });

  it("renders user plant", () => {
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.name = "Beet";
    p.threeDPlants = convertPlants(p.config, [plant]);
    render(<GardenModel {...p} />);
    const plantLabels = screen.queryAllByText("Beet");
    expect(plantLabels.length).toEqual(1);
  });

  it("renders points and weeds", () => {
    const p = fakeProps();
    p.mapPoints = [fakePoint()];
    p.weeds = [fakeWeed()];
    const { container } = render(<GardenModel {...p} />);
    expect(container).toContainHTML("cylinder");
    expect(container).toContainHTML(ASSETS.other.weed);
  });

  it("renders drawn point", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    const addPlantProps = fakeAddPlantProps();
    addPlantProps.designer.drawnPoint = fakeDrawnPoint();
    p.addPlantProps = addPlantProps;
    const { container } = render(<GardenModel {...p} />);
    expect(container).toContainHTML("drawn-point");
  });

  it("doesn't render bot", () => {
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = () => false;
    const { container } = render(<GardenModel {...p} />);
    expect(container).not.toContainHTML("bot");
  });

  it("renders other options", () => {
    mockIsDesktop = false;
    const p = fakeProps();
    p.config.perspective = false;
    p.config.plants = "";
    p.config.labels = true;
    p.config.labelsOnHover = false;
    p.config.sunInclination = -1;
    p.config.sizePreset = "Genesis XL";
    p.config.stats = true;
    p.config.viewCube = true;
    p.config.lab = true;
    p.config.lightsDebug = true;
    p.activeFocus = "plant";
    p.addPlantProps = undefined;
    const { container } = render(<GardenModel {...p} />);
    expect(container).toContainHTML("gray");
    expect(container).toContainHTML("stats");
  });

  it("sets hover", () => {
    const p = fakeProps();
    p.config.labelsOnHover = true;
    const wrapper = mount(<GardenModel {...p} />);
    const e = {
      stopPropagation: jest.fn(),
      intersections: [{ object: { name: "obj" } }],
    };
    wrapper.find({ name: "plants" }).first().simulate("pointerEnter", e);
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it("sets hover: buttons", () => {
    const p = fakeProps();
    p.config.labelsOnHover = true;
    const wrapper = mount(<GardenModel {...p} />);
    const e = {
      stopPropagation: jest.fn(),
      buttons: true,
    };
    wrapper.find({ name: "plants" }).first().simulate("pointerEnter", e);
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it("un-sets hover", () => {
    const p = fakeProps();
    p.config.labelsOnHover = true;
    const wrapper = mount(<GardenModel {...p} />);
    const e = {
      stopPropagation: jest.fn(),
      intersections: [{ object: { name: "obj" } }],
    };
    wrapper.find({ name: "plants" }).first().simulate("pointerLeave", e);
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it("doesn't set hover", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = false;
    const wrapper = mount(<GardenModel {...p} />);
    const e = { stopPropagation: jest.fn() };
    wrapper.find({ name: "plants" }).first().simulate("pointerEnter", e);
    expect(e.stopPropagation).not.toHaveBeenCalled();
  });

  it("logs debug event", () => {
    console.log = jest.fn();
    const p = fakeProps();
    p.config.eventDebug = true;
    const wrapper = mount(<GardenModel {...p} />);
    wrapper.simulate("pointerMove", {
      intersections: [
        { object: { name: "1" } },
        { object: { name: "2" } },
      ],
    });
    expect(console.log).toHaveBeenCalledWith(["1", "2"]);
  });

  it.each<[string, string]>([
    ["Greenhouse", "ground Greenhouse"],
    ["Lab", "ground Lab"],
    ["Outdoor", "ground Outdoor"],
  ])("renders different ground based on scene: %s %s",
    (sceneName, expectedClass) => {
      const p = fakeProps();
      p.config.scene = sceneName;
      const { container } = render(<GardenModel {...p} />);
      expect(container.innerHTML).toContain(expectedClass);
    });

  it("shows night sky", () => {
    const p = fakeProps();
    p.config.sun = 0;
    const { container } = render(<GardenModel {...p} />);
    expect(container.innerHTML).toContain("color=\"0,0,0\"");
  });
});
