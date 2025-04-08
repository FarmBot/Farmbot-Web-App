import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { clone } from "lodash";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { INITIAL } from "../../config";
import {
  calculatePlantPositions,
  convertPlants,
  ThreeDPlant,
  ThreeDPlantProps,
} from "../plants";
import { CROPS } from "../../../crops/constants";
import { Path } from "../../../internal_urls";
import { Actions } from "../../../constants";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";

describe("calculatePlantPositions()", () => {
  it("calculates plant positions", () => {
    const config = clone(INITIAL);
    config.plants = "Spring";
    const positions = calculatePlantPositions(config);
    expect(positions).toContainEqual({
      icon: CROPS.beet.icon,
      label: "Beet",
      size: 150,
      spread: 175,
      x: 350,
      y: 680,
    });
    expect(positions.length).toEqual(65);
  });

  it("returns no plants", () => {
    const config = clone(INITIAL);
    config.plants = "";
    const positions = calculatePlantPositions(config);
    expect(positions.length).toEqual(0);
  });
});

describe("convertPlants()", () => {
  it("converts plants", () => {
    const config = clone(INITIAL);
    config.bedXOffset = 10;
    config.bedYOffset = 1;

    const plant0 = fakePlant();
    plant0.body.name = "Spinach";
    plant0.body.openfarm_slug = "spinach";
    plant0.body.x = 100;
    plant0.body.y = 200;

    const plant1 = fakePlant();
    plant1.body.name = "Unknown";
    plant1.body.openfarm_slug = "not-set";
    plant1.body.x = 1000;
    plant1.body.y = 2000;

    const plants = [plant0, plant1];

    const convertedPlants = convertPlants(config, plants);

    expect(convertedPlants).toEqual([{
      icon: CROPS.spinach.icon,
      id: 1,
      label: "Spinach",
      size: 50,
      spread: 0,
      x: 110,
      y: 201,
    },
    {
      icon: CROPS["generic-plant"].icon,
      id: 2,
      label: "Unknown",
      size: 50,
      spread: 0,
      x: 1010,
      y: 2001,
    },
    ]);
  });
});

describe("<ThreeDPlant />", () => {
  const fakeProps = (): ThreeDPlantProps => {
    const config = clone(INITIAL);
    const plant = fakePlant();
    plant.body.name = "Beet";
    return {
      plant: convertPlants(config, [plant])[0],
      i: 0,
      config: config,
      hoveredPlant: undefined,
      visible: true,
    };
  };

  it("renders label", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = false;
    p.labelOnly = true;
    render(<ThreeDPlant {...p} />);
    expect(screen.getByText("Beet")).toBeInTheDocument();
  });

  it("renders hovered label", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = true;
    p.hoveredPlant = 0;
    p.labelOnly = true;
    render(<ThreeDPlant {...p} />);
    expect(screen.getByText("Beet")).toBeInTheDocument();
  });

  it("renders plant", () => {
    const p = fakeProps();
    p.config.labels = false;
    p.config.labelsOnHover = false;
    p.labelOnly = false;
    render(<ThreeDPlant {...p} />);
    const { container } = render(<ThreeDPlant {...p} />);
    expect(container).toContainHTML("image");
  });

  it("navigates to plant info", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.plant.id = 1;
    const { container } = render(<ThreeDPlant {...p} />);
    const plant = container.querySelector("[name='0'");
    plant && fireEvent.click(plant);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants("1"));
  });

  it("doesn't navigate to plant info", () => {
    const p = fakeProps();
    p.dispatch = undefined;
    p.plant.id = 1;
    const { container } = render(<ThreeDPlant {...p} />);
    const plant = container.querySelector("[name='0'");
    plant && fireEvent.click(plant);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
