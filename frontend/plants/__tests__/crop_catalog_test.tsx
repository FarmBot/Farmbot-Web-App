const lodash = require("lodash");
lodash.debounce = jest.fn(x => x);

import React from "react";
import {
  mapStateToProps, RawCropCatalog as CropCatalog,
} from "../crop_catalog";
import { fireEvent, render, screen } from "@testing-library/react";
import { CropCatalogProps } from "../../farm_designer/interfaces";
import { Actions } from "../../constants";
import { fakeState } from "../../__test_support__/fake_state";
import { Path } from "../../internal_urls";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakePlant } from "../../__test_support__/fake_state/resources";

describe("<CropCatalog />", () => {
  const fakeProps = (): CropCatalogProps => ({
    dispatch: jest.fn(),
    plant: undefined,
    bulkPlantSlug: undefined,
    hoveredPlant: { plantUUID: undefined },
    cropSearchQuery: "",
  });

  it("renders", () => {
    render(<CropCatalog {...fakeProps()} />);
    expect(screen.getByText("Choose a crop")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search crops...")).toBeInTheDocument();
  });

  it("changes search term", () => {
    const p = fakeProps();
    render(<CropCatalog {...p} />);
    fireEvent.change(screen.getByPlaceholderText("Search crops..."),
      { target: { value: "term" } });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SEARCH_QUERY_CHANGE,
      payload: "term",
    });
  });

  it("goes back", () => {
    const { container } = render(<CropCatalog {...fakeProps()} />);
    const backArrow = container.querySelector(".fa-arrow-left");
    expect(backArrow).toBeTruthy();
    fireEvent.click(backArrow as Element);
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants());
  });

  it("dispatches upon unmount", () => {
    const p = fakeProps();
    const { unmount } = render(<CropCatalog {...p} />);
    unmount();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PLANT_TYPE_CHANGE_ID, payload: undefined,
    });
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    expect(props.plant).toEqual(undefined);
  });

  it("returns props with plant", () => {
    const state = fakeState();
    const plant = fakePlant();
    plant.body.id = 1;
    state.resources = buildResourceIndex([plant]);
    state.resources.consumers.farm_designer.plantTypeChangeId = 1;
    const props = mapStateToProps(state);
    expect(props.plant).toEqual(plant);
  });
});
