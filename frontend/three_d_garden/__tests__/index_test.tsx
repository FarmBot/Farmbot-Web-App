jest.mock("../../config_storage/actions", () => ({
  getWebAppConfigValue: jest.fn(() => jest.fn()),
  setWebAppConfigValue: jest.fn(),
}));

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  ThreeDGardenProps, ThreeDGarden, ThreeDGardenToggle, ThreeDGardenToggleProps,
} from "../index";
import { INITIAL } from "../config";
import { clone } from "lodash";
import { fakeAddPlantProps } from "../../__test_support__/fake_props";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";
import { Path } from "../../internal_urls";
import { Actions } from "../../constants";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { BooleanSetting } from "../../session_keys";
import { fakeDevice } from "../../__test_support__/resource_index_builder";

describe("<ThreeDGarden />", () => {
  const fakeProps = (): ThreeDGardenProps => ({
    config: clone(INITIAL),
    addPlantProps: fakeAddPlantProps(),
    mapPoints: [],
    weeds: [],
    threeDPlants: [],
  });

  it("renders", () => {
    const { container } = render(<ThreeDGarden {...fakeProps()} />);
    expect(container).toContainHTML("three-d-garden");
  });
});

describe("<ThreeDGardenToggle />", () => {
  const fakeProps = (): ThreeDGardenToggleProps => ({
    navigate: jest.fn(),
    dispatch: jest.fn(),
    device: fakeDevice().body,
    designer: fakeDesignerState(),
    threeDGarden: true,
  });

  it("renders off", () => {
    const p = fakeProps();
    p.threeDGarden = false;
    render(<ThreeDGardenToggle {...p} />);
    const settingsButton = screen.queryByTitle("3D Settings");
    const toggle = screen.queryByTitle("show");
    expect(settingsButton).not.toBeInTheDocument();
    expect(toggle).toBeInTheDocument();
  });

  it("navigates to settings", () => {
    const p = fakeProps();
    render(<ThreeDGardenToggle {...p} />);
    const settingsButton = screen.getByTitle("3D Settings");
    fireEvent.click(settingsButton);
    expect(p.navigate).toHaveBeenCalledWith(Path.settings("3d_garden"));
  });

  it("disables top down view", () => {
    const p = fakeProps();
    p.designer.threeDTopDownView = true;
    render(<ThreeDGardenToggle {...p} />);
    const isoViewButton = screen.getByTitle("3D View");
    fireEvent.click(isoViewButton);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_3D_TOP_DOWN_VIEW,
      payload: false,
    });
  });

  it("enables top down view", () => {
    const p = fakeProps();
    render(<ThreeDGardenToggle {...p} />);
    const topDownViewButton = screen.getByTitle("Top down View");
    fireEvent.click(topDownViewButton);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_3D_TOP_DOWN_VIEW,
      payload: true,
    });
  });

  it("disables exaggerated z", () => {
    const p = fakeProps();
    p.designer.threeDExaggeratedZ = true;
    render(<ThreeDGardenToggle {...p} />);
    const isoViewButton = screen.getByTitle("normal z");
    fireEvent.click(isoViewButton);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_3D_EXAGGERATED_Z,
      payload: false,
    });
  });

  it("enables exaggerated z", () => {
    const p = fakeProps();
    render(<ThreeDGardenToggle {...p} />);
    const topDownViewButton = screen.getByTitle("exaggerated z");
    fireEvent.click(topDownViewButton);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_3D_EXAGGERATED_Z,
      payload: true,
    });
  });

  it("toggles 3D view", () => {
    const p = fakeProps();
    render(<ThreeDGardenToggle {...p} />);
    const toggle = screen.getByTitle("hide");
    fireEvent.click(toggle);
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.three_d_garden,
      false);
  });
});
