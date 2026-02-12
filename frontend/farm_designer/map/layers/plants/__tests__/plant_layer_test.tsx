import React from "react";
import { PlantLayer } from "../plant_layer";
import {
  fakePlant, fakePlantTemplate,
} from "../../../../../__test_support__/fake_state/resources";
import { PlantLayerProps } from "../../../interfaces";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { render, fireEvent } from "@testing-library/react";
import { Path } from "../../../../../internal_urls";
import { Actions } from "../../../../../constants";
import { mockDispatch } from "../../../../../__test_support__/fake_dispatch";

describe("<PlantLayer />", () => {
  beforeEach(() => {
    location.pathname = Path.mock(Path.plants());
  });

  const fakeProps = (): PlantLayerProps => ({
    visible: true,
    plants: [fakePlant()],
    mapTransformProps: fakeMapTransformProps(),
    currentPlant: undefined,
    dragging: false,
    editing: false,
    boxSelected: undefined,
    groupSelected: [],
    dispatch: jest.fn(),
    zoomLvl: 1,
    activeDragXY: { x: undefined, y: undefined, z: undefined },
    animate: true,
    hoveredPlant: undefined,
    hoveredSpread: undefined,
    interactions: true,
  });

  const renderLayer = (props: PlantLayerProps) =>
    render(<svg><PlantLayer {...props} /></svg>);

  const getLayer = (container: HTMLElement) => {
    const layer = container.querySelector("#plant-layer");
    if (!layer) { throw new Error("Missing plant layer"); }
    return layer;
  };

  const getWrapper = (container: HTMLElement) => {
    const wrapper = container.querySelector(".plant-link-wrapper");
    if (!wrapper) { throw new Error("Missing plant wrapper"); }
    return wrapper;
  };

  const getImage = (container: HTMLElement) => {
    const image = container.querySelector("image");
    if (!image) { throw new Error("Missing plant image"); }
    return image;
  };

  it("shows plants", () => {
    const p = fakeProps();
    const { container } = renderLayer(p);
    const layer = getLayer(container);
    expect(layer.querySelectorAll(".plant-link-wrapper").length).toEqual(1);
    expect(layer.querySelector(".soil-cloud")).toBeInTheDocument();
    expect(layer.querySelector("#plant-icon")).toBeInTheDocument();
    expect(getImage(container).getAttribute("visibility")).toEqual("visible");
    expect(layer.innerHTML).toContain("icon");
    expect(getImage(container).getAttribute("height")).toEqual("40");
    expect(getImage(container).getAttribute("width")).toEqual("40");
    expect(getImage(container).getAttribute("x")).toEqual("80");
    expect(getImage(container).getAttribute("y")).toEqual("180");
    expect(layer.querySelector("#drag-helpers")).toBeInTheDocument();
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const { container } = renderLayer(p);
    expect(getLayer(container).innerHTML).toEqual("");
  });

  it("is in clickable mode", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    p.interactions = true;
    p.plants[0].body.id = 1;
    const { container } = renderLayer(p);
    expect((getWrapper(container) as HTMLElement).style.cursor).toEqual("pointer");
  });

  it("is in non-clickable mode", () => {
    location.pathname = Path.mock(Path.cropSearch("mint/add"));
    const p = fakeProps();
    p.interactions = false;
    p.plants[0].body.id = 1;
    const { container } = renderLayer(p);
    expect((getWrapper(container) as HTMLElement).style.pointerEvents)
      .toEqual("none");
  });

  it("has link to plant", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    p.plants[0].body.id = 5;
    const { container } = renderLayer(p);
    expect((getWrapper(container) as HTMLAnchorElement).getAttribute("href"))
      .toEqual(Path.plants(5));
  });

  it("clicks plant", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.plants[0].body.id = 5;
    const { container } = renderLayer(p);
    fireEvent.click(getWrapper(container));
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN,
      payload: true,
    });
  });

  it("has link to plant template", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    p.plants = [fakePlantTemplate()];
    p.plants[0].body.id = 5;
    const { container } = renderLayer(p);
    expect((getWrapper(container) as HTMLAnchorElement).getAttribute("href"))
      .toEqual(Path.plantTemplates(5));
  });

  it("has hovered plant", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    const plant = fakePlant();
    p.plants = [plant];
    p.currentPlant = plant;
    p.hoveredPlant = plant;
    const { container } = renderLayer(p);
    expect(container.querySelector("#selected-plant-indicator")).toBeNull();
  });

  it("has plant selected by selection box", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    const plant = fakePlant();
    p.plants = [plant];
    p.boxSelected = [plant.uuid];
    const { container } = renderLayer(p);
    expect(container.querySelector("#selected-plant-indicator"))
      .toBeInTheDocument();
  });

  it("doesn't allow clicking of unsaved plants", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    p.interactions = false;
    p.plants[0].body.id = 0;
    const { container } = renderLayer(p);
    expect((getWrapper(container) as HTMLElement).style.pointerEvents)
      .toEqual("none");
  });

  it("wraps the component in <g> (instead of <Link>", () => {
    location.pathname = Path.mock(Path.groups(15));
    const p = fakeProps();
    const { container } = renderLayer(p);
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelectorAll("g").length).toBeGreaterThan(0);
  });

  it("is dragging", () => {
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.id = 0;
    p.plants = [plant];
    p.currentPlant = plant;
    p.dragging = true;
    p.editing = true;
    const { container } = renderLayer(p);
    expect(getImage(container).getAttribute("visibility")).toEqual("hidden");
    expect(getImage(container).getAttribute("opacity")).toEqual("0.4");
  });
});
