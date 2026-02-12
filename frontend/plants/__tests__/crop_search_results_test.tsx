import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { CropSearchResults, SearchResultProps } from "../crop_search_results";
import { fakePlant } from "../../__test_support__/fake_state/resources";
import { Path } from "../../internal_urls";
import { Actions } from "../../constants";
import * as crud from "../../api/crud";

let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;

beforeEach(() => {
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
});

afterEach(() => {
  editSpy.mockRestore();
  saveSpy.mockRestore();
});

describe("<CropSearchResults />", () => {
  const fakeProps = (): SearchResultProps => ({
    searchTerm: "mint",
    plant: undefined,
    dispatch: jest.fn(),
    bulkPlantSlug: undefined,
    hoveredPlant: { plantUUID: undefined },
  });

  it("renders CropSearchResults", () => {
    const p = fakeProps();
    render(<CropSearchResults {...p} />);
    expect(screen.getByText("Mint")).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links.length).toEqual(1);
    expect(links[0]).toHaveAttribute("href", expect.stringContaining("mint"));
  });

  it("renders for plant type change", () => {
    const p = fakeProps();
    p.plant = fakePlant();
    p.plant.body.id = 1;
    const { container } = render(<CropSearchResults {...p} />);
    expect(screen.getByText("Mint")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", Path.plants(1));
    expect(container.querySelector("img")?.classList.contains("center")).toBeFalsy();
  });

  it("renders without image", () => {
    const p = fakeProps();
    p.searchTerm = "foo-bar";
    const { container } = render(<CropSearchResults {...p} />);
    expect(container.querySelector("img")?.classList.contains("center")).toBeTruthy();
  });

  it("changes plant type", () => {
    const p = fakeProps();
    p.plant = fakePlant();
    p.plant.body.id = 1;
    render(<CropSearchResults {...p} />);
    fireEvent.click(screen.getByRole("link"));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PLANT_TYPE_CHANGE_ID,
      payload: undefined,
    });
    expect(editSpy).toHaveBeenCalledWith(p.plant, {
      name: "Mint",
      openfarm_slug: "mint",
    });
    expect(saveSpy).toHaveBeenCalledWith(p.plant.uuid);
  });

  it("changes plant type and hover", () => {
    const p = fakeProps();
    p.plant = fakePlant();
    p.plant.body.id = 1;
    p.hoveredPlant = { plantUUID: p.plant.uuid };
    render(<CropSearchResults {...p} />);
    fireEvent.click(screen.getByRole("link"));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_PLANT,
      payload: { plantUUID: p.plant.uuid },
    });
  });

  it("sets bulk slug", () => {
    const p = fakeProps();
    p.bulkPlantSlug = "slug";
    render(<CropSearchResults {...p} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", Path.plants("select"));
    fireEvent.click(link);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SLUG_BULK,
      payload: "mint",
    });
    expect(editSpy).not.toHaveBeenCalled();
  });
});
