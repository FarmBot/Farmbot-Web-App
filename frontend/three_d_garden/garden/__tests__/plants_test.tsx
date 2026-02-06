import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { clone } from "lodash";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { INITIAL } from "../../config";
import {
  ThreeDPlantLabel,
  ThreeDPlantLabelProps,
  ThreeDPlantSpread,
  ThreeDPlantSpreadProps,
} from "../plants";
import { Path } from "../../../internal_urls";
import { Actions } from "../../../constants";
import { convertPlants } from "../../../farm_designer/three_d_garden_map";

describe("<ThreeDPlantLabel />", () => {
  afterEach(cleanup);

  beforeEach(() => {
    location.pathname = Path.mock(Path.designer());
  });

  const fakeProps = (): ThreeDPlantLabelProps => {
    const config = clone(INITIAL);
    const plant = fakePlant();
    plant.body.name = "Beet";
    plant.body.id = 1;
    const otherPlant = fakePlant();
    otherPlant.body.id = 2;
    return {
      plant: convertPlants(config, [plant])[0],
      i: 0,
      config: config,
      hoveredPlant: undefined,
      getZ: () => 0,
    };
  };

  it("renders label", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = false;
    render(<ThreeDPlantLabel {...p} />);
    expect(screen.getByText("Beet")).toBeInTheDocument();
  });

  it("renders hovered label", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = true;
    p.hoveredPlant = 0;
    render(<ThreeDPlantLabel {...p} />);
    expect(screen.getByText("Beet")).toBeInTheDocument();
  });
});

describe("<ThreeDPlantSpread />", () => {
  afterEach(cleanup);

  beforeEach(() => {
    location.pathname = Path.mock(Path.designer());
  });

  const fakeProps = (): ThreeDPlantSpreadProps => {
    const config = clone(INITIAL);
    const plant = fakePlant();
    plant.body.name = "Beet";
    plant.body.id = 1;
    const otherPlant = fakePlant();
    otherPlant.body.id = 2;
    return {
      plant: convertPlants(config, [plant])[0],
      config: config,
      visible: true,
      getZ: () => 0,
      activePositionRef: { current: { x: 0, y: 0 } },
      plants: convertPlants(config, [plant, otherPlant]),
      spreadVisible: false,
    };
  };


  it("renders spread", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.spreadVisible = true;
    const { container } = render(<ThreeDPlantSpread {...p} />);
    expect(container).toContainHTML("sphere");
  });

  it("renders spread: edit plant mode", () => {
    location.pathname = Path.mock(Path.plants("1"));
    const p = fakeProps();
    p.spreadVisible = false;
    const { container } = render(<ThreeDPlantSpread {...p} />);
    expect(container).toContainHTML("sphere");
  });

  it("renders spread: edit plant mode without plant", () => {
    location.pathname = Path.mock(Path.plants("999999"));
    const p = fakeProps();
    p.spreadVisible = false;
    const { container } = render(<ThreeDPlantSpread {...p} />);
    expect(container).toContainHTML("sphere");
  });

  it("handles click on spread part", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { container } = render(<ThreeDPlantSpread {...p} />);
    const group = container.querySelector("group");
    group && fireEvent.click(group);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants("1"));
  });
});
