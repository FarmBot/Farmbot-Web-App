import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  mapStateToProps, RawSceneObjectCatalog, SCENE_OBJECT_CATALOG,
  SceneObjectCatalogProps,
} from "../catalog";
import { Actions } from "../../constants";
import { Path } from "../../internal_urls";
import { fakeState } from "../../__test_support__/fake_state";
import {
  LAB_SCENE_OBJECTS,
  SCENE_OBJECT_CATALOG_SCENES,
} from "../../three_d_garden/scenes/scene_object_data";
import { fakeSceneObject } from
  "../../__test_support__/fake_state/resources";

describe("<RawSceneObjectCatalog />", () => {
  const fakeProps = (): SceneObjectCatalogProps => ({
    dispatch: jest.fn(),
    sceneObjects: [],
  });

  it("renders every preset and the custom entry", () => {
    const { container } = render(<RawSceneObjectCatalog {...fakeProps()} />);
    const expectedCount = SCENE_OBJECT_CATALOG_SCENES.greenhouse.length
      + SCENE_OBJECT_CATALOG_SCENES.lab.length
      + SCENE_OBJECT_CATALOG_SCENES.outdoor.length
      + 1;

    expect(screen.getByText("Choose a scene object")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search scene objects..."))
      .toBeInTheDocument();
    expect(container.querySelectorAll(".scene-object-catalog-tile"))
      .toHaveLength(expectedCount);
    expect(container.querySelectorAll(".scene-object-catalog-label"))
      .toHaveLength(expectedCount);
    expect(SCENE_OBJECT_CATALOG).toHaveLength(expectedCount);
    expect(screen.queryByText("Greenhouse")).not.toBeInTheDocument();
    expect(screen.queryByText("Lab")).not.toBeInTheDocument();
    expect(screen.queryByText("Outdoor")).not.toBeInTheDocument();
    expect(screen.getByText("Starter Tray")).toBeInTheDocument();
    expect(screen.queryByText("Starter Tray 2")).not.toBeInTheDocument();
    expect(screen.getAllByText("Shelf")).toHaveLength(1);
    expect(screen.queryByText("Lower Shelf")).not.toBeInTheDocument();
    expect(screen.queryByText("Upper Shelf")).not.toBeInTheDocument();
  });

  it("filters by name and scene", () => {
    const { container } = render(<RawSceneObjectCatalog {...fakeProps()} />);
    const search = screen.getByPlaceholderText("Search scene objects...");

    fireEvent.change(search, { target: { value: "solar panel" } });
    expect(screen.getByText("Solar Panel")).toBeInTheDocument();
    expect(screen.queryByText("Tree")).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "Lab" } });
    expect(container.querySelectorAll(".scene-object-catalog-tile"))
      .toHaveLength(LAB_SCENE_OBJECTS.length - 2);
    expect(screen.queryByText("Lab")).not.toBeInTheDocument();
  });

  it("shows no results", () => {
    render(<RawSceneObjectCatalog {...fakeProps()} />);

    fireEvent.change(screen.getByPlaceholderText("Search scene objects..."), {
      target: { value: "missing object" },
    });

    expect(screen.getByText("No search results")).toBeInTheDocument();
  });

  it("opens the add form with a preset", () => {
    const p = fakeProps();
    render(<RawSceneObjectCatalog {...p} />);

    fireEvent.click(screen.getByRole("button", { name: "Tree" }));

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
      payload: { ...SCENE_OBJECT_CATALOG_SCENES.outdoor[0] },
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.sceneObjects("add"));
  });

  it("increments a colliding preset name", () => {
    const p = fakeProps();
    p.sceneObjects = [
      fakeSceneObject({ name: "Tree" }),
      fakeSceneObject({ name: "Tree 2" }),
    ];
    render(<RawSceneObjectCatalog {...p} />);

    fireEvent.click(screen.getByRole("button", { name: "Tree" }));

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
      payload: { ...SCENE_OBJECT_CATALOG_SCENES.outdoor[0], name: "Tree 3" },
    });
  });

  it("opens the blank add form for a custom object", () => {
    const p = fakeProps();
    render(<RawSceneObjectCatalog {...p} />);

    fireEvent.click(screen.getByRole("button", {
      name: "Custom Scene Object",
    }));

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
      payload: undefined,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.sceneObjects("add"));
  });

  it("goes back to the inventory", () => {
    const { container } = render(<RawSceneObjectCatalog {...fakeProps()} />);

    fireEvent.click(container.querySelector(".fa-arrow-left") as Element);

    expect(mockNavigate).toHaveBeenCalledWith(Path.sceneObjects());
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    expect(mapStateToProps(state).dispatch).toEqual(state.dispatch);
  });
});
