let mockIsDesktop = false;
jest.mock("../../screen_size", () => ({
  isDesktop: () => mockIsDesktop,
}));

const mockSetPosition = jest.fn();
interface MockRefCurrent {
  position: { set: Function; };
}
interface MockRef {
  current: MockRefCurrent | undefined;
}
const mockRef: MockRef = { current: undefined };
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useRef: () => mockRef,
}));

import React from "react";
import { mount } from "enzyme";
import { GardenModelProps, GardenModel } from "../garden";
import { clone } from "lodash";
import { INITIAL } from "../config";
import { render, screen } from "@testing-library/react";
import { fakePlant } from "../../__test_support__/fake_state/resources";
import { fakeAddPlantProps } from "../../__test_support__/fake_props";
import { Path } from "../../internal_urls";

describe("<GardenModel />", () => {
  const fakeProps = (): GardenModelProps => ({
    config: clone(INITIAL),
    activeFocus: "",
    setActiveFocus: jest.fn(),
    addPlantProps: fakeAddPlantProps([]),
  });

  it("renders", () => {
    const { container } = render(<GardenModel {...fakeProps()} />);
    expect(container).toContainHTML("zoom-beacons");
    expect(container).not.toContainHTML("stats");
    expect(container).toContainHTML("darkgreen");
  });

  it("shows pointer plant", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    render(<GardenModel {...p} />);
    const pointerPlant = screen.getByText("pointerPlant");
    expect(pointerPlant).toBeInTheDocument();
  });

  it("doesn't show pointer plant", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    render(<GardenModel {...p} />);
    const pointerPlant = screen.queryByText("pointerPlant");
    expect(pointerPlant).not.toBeInTheDocument();
  });

  it("renders no user plants", () => {
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    render(<GardenModel {...p} />);
    const plantLabels = screen.queryAllByText("Beet");
    expect(plantLabels.length).toEqual(0);
  });

  it("renders user plant", () => {
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.name = "Beet";
    p.addPlantProps = fakeAddPlantProps([plant]);
    render(<GardenModel {...p} />);
    const plantLabels = screen.queryAllByText("Beet");
    expect(plantLabels.length).toEqual(1);
  });

  it("renders promo plants", () => {
    const p = fakeProps();
    p.addPlantProps = undefined;
    render(<GardenModel {...p} />);
    const plantLabels = screen.queryAllByText("Beet");
    expect(plantLabels.length).toEqual(7);
  });

  it("renders other options", () => {
    mockIsDesktop = false;
    const p = fakeProps();
    p.config.perspective = false;
    p.config.plants = "";
    p.config.labels = true;
    p.config.labelsOnHover = false;
    p.config.sizePreset = "Genesis XL";
    p.config.stats = true;
    p.config.viewCube = true;
    p.config.lab = true;
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

  it("updates pointer plant position", () => {
    mockRef.current = { position: { set: mockSetPosition } };
    const p = fakeProps();
    render(<GardenModel {...p} />);
    expect(mockSetPosition).toHaveBeenCalledWith(0, 0, 0);
  });

  it("handles missing ref", () => {
    mockRef.current = undefined;
    const p = fakeProps();
    render(<GardenModel {...p} />);
  });
});
