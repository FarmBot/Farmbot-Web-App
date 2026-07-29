import React from "react";
import {
  fireEvent, render, screen,
} from "@testing-library/react";
import * as threeDrei from "@react-three/drei";
import { clone } from "lodash";
import { DoubleSide, Vector3 } from "three";
import * as ui from "../../../ui";
import { INITIAL } from "../../config";
import * as controls from "../../controls";
import { getWorldPositionFunc } from "../../helpers";
import {
  AREA_SELECTION_GHOST_SIZE, areaSelectionPointTypes,
  areaSelectionTitle, GardenAreaSelectionOverlay, getGroupAreaSelectionBox,
  getAreaSelectionGeometry,
  GroupAreaSelectionOverlay, GroupAreaVisual, getGhostAreaSelectionBox,
  normalizeAreaSelectionBox,
  resizeAreaSelectionBox,
} from "../area_selection";
import {
  actRenderer, createRenderer, unmountRenderer,
} from "../../../__test_support__/test_renderer";
import { fakePointGroup } from
  "../../../__test_support__/fake_state/resources";
import {
  BufferAttribute, Mesh, MeshBasicMaterial,
} from "../../components";
import { RenderOrder } from "../../constants";
import { precomputeTriangles } from "../../triangle_functions";

describe("area selection geometry", () => {
  it("creates a 200mm ghost rectangle within garden bounds", () => {
    const config = { botSizeX: 1000, botSizeY: 800 };
    expect(getGhostAreaSelectionBox({ x: 100, y: 200 }, config))
      .toEqual({ x0: 100, y0: 200, x1: 300, y1: 400 });
    const edge = getGhostAreaSelectionBox({ x: 950, y: 750 }, config);
    expect(Math.abs(edge.x1 - edge.x0)).toEqual(
      AREA_SELECTION_GHOST_SIZE,
    );
    expect(Math.abs(edge.y1 - edge.y0)).toEqual(
      AREA_SELECTION_GHOST_SIZE,
    );
    expect(edge).toEqual({ x0: 950, y0: 750, x1: 750, y1: 550 });
  });

  it("normalizes and constrains resized edges", () => {
    expect(normalizeAreaSelectionBox({
      x0: 500, y0: 400, x1: 100, y1: 200,
    })).toEqual({ x0: 100, y0: 200, x1: 500, y1: 400 });
    const box = { x0: 100, y0: 200, x1: 500, y1: 400 };
    const config = { botSizeX: 1000, botSizeY: 800 };
    expect(resizeAreaSelectionBox(box, "x0", -50, config).x0)
      .toEqual(0);
    expect(resizeAreaSelectionBox(box, "x1", 1200, config).x1)
      .toEqual(1000);
    expect(resizeAreaSelectionBox(box, "y0", 600, config).y0)
      .toEqual(400);
    expect(resizeAreaSelectionBox(box, "y1", 50, config).y1)
      .toEqual(200);
  });

  it("clips the original soil triangles to the selection bounds", () => {
    const config = { ...clone(INITIAL), botSizeX: 100, botSizeY: 100 };
    const triangles = precomputeTriangles([
      [0, 0, 0],
      [100, 0, 0],
      [100, 100, 100],
      [0, 100, 0],
    ], [0, 1, 2, 0, 2, 3]);
    const geometry = getAreaSelectionGeometry(
      { x0: 20, y0: 30, x1: 80, y1: 70 },
      config,
      triangles,
    );
    const fillPoints: number[][] = [];
    for (let i = 0; i < geometry.fillVertices.length; i += 3) {
      fillPoints.push([...geometry.fillVertices.slice(i, i + 3)]);
    }

    expect(fillPoints).toHaveLength(6);
    expect(geometry.fillIndices).toHaveLength(12);
    expect(geometry.outlinePoints).toHaveLength(7);
    expect(fillPoints).toContainEqual(getWorldPositionFunc(config)({
      x: 30,
      y: 30,
      z: 38,
    }));
    expect(fillPoints).toContainEqual(getWorldPositionFunc(config)({
      x: 70,
      y: 70,
      z: 78,
    }));
    expect(fillPoints).toContainEqual(getWorldPositionFunc(config)({
      x: 20,
      y: 70,
      z: 28,
    }));
    expect(geometry.outlinePoints).toContainEqual(
      getWorldPositionFunc(config)({ x: 30, y: 30, z: 38 }),
    );
    expect(geometry.outlinePoints[0]).toEqual(
      geometry.outlinePoints[geometry.outlinePoints.length - 1],
    );
  });

  it("labels supported selection types", () => {
    expect(areaSelectionPointTypes("Plant")).toEqual(["Plant"]);
    expect(areaSelectionPointTypes("All")).toEqual([
      "Plant", "GenericPointer", "Weed", "ToolSlot",
    ]);
    expect(areaSelectionTitle(1, "Plant")).toEqual("1 plant");
    expect(areaSelectionTitle(3, "Plant")).toEqual("3 plants");
    expect(areaSelectionTitle(2, "All")).toEqual("2 objects");
  });

  it("resolves bounded group location areas", () => {
    const group = fakePointGroup();
    group.body.criteria.number_gt = { x: 100 };
    group.body.criteria.number_lt = { y: 700 };
    const config = { botSizeX: 1000, botSizeY: 800 };
    expect(getGroupAreaSelectionBox(group, config)).toEqual({
      x0: 100,
      y0: 0,
      x1: 1000,
      y1: 700,
    });
    group.body.criteria.number_gt = {};
    group.body.criteria.number_lt = {};
    expect(getGroupAreaSelectionBox(group, config)).toBeUndefined();
    expect(getGroupAreaSelectionBox(group, config, true)).toEqual({
      x0: 0,
      y0: 0,
      x1: 1000,
      y1: 800,
    });
  });
});

describe("<GardenAreaSelectionOverlay />", () => {
  const config = clone(INITIAL);
  config.botSizeX = 1000;
  config.botSizeY = 800;
  const soilSurfaceTriangles = precomputeTriangles([
    [0, 0, -100],
    [1000, 0, -100],
    [1000, 800, -100],
    [0, 800, -100],
  ], [0, 1, 2, 0, 2, 3]);
  const props = ():
    React.ComponentProps<typeof GardenAreaSelectionOverlay> => ({
    config,
    getZ: jest.fn(() => -100),
    ghostPosition: undefined,
    selection: undefined,
    shiftPressed: false,
    soilSurfaceTriangles,
    selectedCount: 0,
    onBoxChange: jest.fn(),
    onClose: jest.fn(),
    onCreateGroup: jest.fn(),
    onDelete: jest.fn(),
    onOpenPanel: jest.fn(),
    onPointTypeChange: jest.fn(),
  });
  const mockLine = () => jest.spyOn(threeDrei, "Line")
    .mockImplementation(props => <div
      data-testid={props.name}
      data-depth-test={`${props.depthTest}`}
      data-depth-write={`${props.depthWrite}`}
      data-line-width={props.lineWidth}
      data-opacity={props.opacity}
      data-render-order={props.renderOrder} />);

  it("renders passive group areas with grid depth behavior", () => {
    const lineSpy = mockLine();
    render(<GroupAreaVisual
      box={{ x0: 100, y0: 200, x1: 500, y1: 600 }}
      config={config}
      gridLayer={true}
      name={"group-area"}
      soilSurfaceTriangles={soilSurfaceTriangles} />);

    const rectangle = screen.getByTestId("group-area-rectangle");
    expect(rectangle).toHaveAttribute("data-depth-test", "true");
    expect(rectangle).toHaveAttribute("data-depth-write", "true");
    expect(rectangle).toHaveAttribute("data-render-order", "0");
    lineSpy.mockRestore();
  });

  it("shows and hides the shift-hover ghost", () => {
    const lineSpy = mockLine();
    const p = props();
    p.shiftPressed = true;
    p.ghostPosition = { x: 100, y: 200 };
    const { container, rerender } = render(
      <GardenAreaSelectionOverlay {...p} />,
    );
    expect(screen.getByTestId("area-selection-ghost")).toBeInTheDocument();
    expect(screen.getByTestId("area-selection-ghost"))
      .toHaveAttribute("data-opacity", "0.95");
    expect(container.querySelector("[name='area-selection-ghost-fill']"))
      .toBeInTheDocument();
    expect(container.querySelector("[name='area-selection-popup']"))
      .toBeFalsy();

    rerender(
      <GardenAreaSelectionOverlay
        {...p}
        shiftPressed={false} />,
    );
    expect(screen.queryByTestId("area-selection-ghost"))
      .not.toBeInTheDocument();
    expect(container.querySelector("[name='area-selection-ghost-fill']"))
      .not.toBeInTheDocument();
    lineSpy.mockRestore();
  });

  it("shows a ghost while choosing a replacement first corner", () => {
    const lineSpy = mockLine();
    const p = props();
    p.ghostPosition = { x: 300, y: 400 };
    p.selection = {
      phase: "firstCorner",
      pointType: "Plant",
      box: { x0: 100, y0: 200, x1: 500, y1: 600 },
    };
    const { container } = render(
      <GardenAreaSelectionOverlay {...p} />,
    );
    expect(screen.getByTestId("area-selection-ghost")).toBeInTheDocument();
    expect(container.querySelector("[name$='-control']"))
      .toBeFalsy();
    expect(container.querySelector("[name='area-selection-popup']"))
      .toBeFalsy();
    lineSpy.mockRestore();
  });

  it("shows the live selection count while drawing", () => {
    const lineSpy = mockLine();
    const labelSpy = jest.spyOn(controls, "ControlLabel")
      .mockImplementation(props => <i data-testid={props.name}>
        {props.children}
      </i>);
    const p = props();
    p.selectedCount = 28;
    p.selection = {
      phase: "drawing",
      pointType: "Plant",
      box: { x0: 100, y0: 200, x1: 500, y1: 600 },
    };
    render(<GardenAreaSelectionOverlay {...p} />);

    expect(screen.getByTestId("area-selection-count-label"))
      .toHaveTextContent("28 plants");
    expect(labelSpy).toHaveBeenCalledWith(expect.objectContaining({
      position: getWorldPositionFunc(config)({ x: 500, y: 600, z: -20 }),
      enabled: false,
    }), undefined);
    labelSpy.mockRestore();
    lineSpy.mockRestore();
  });

  it("fills selected areas and renders them with the grid", () => {
    const p = props();
    p.selection = {
      phase: "drawing",
      pointType: "Plant",
      box: { x0: 100, y0: 200, x1: 500, y1: 600 },
    };
    const wrapper = createRenderer(<GardenAreaSelectionOverlay {...p} />);
    const fill = wrapper.root.findAllByType(Mesh)
      .find(node => node.props.name == "area-selection-fill");
    const line = wrapper.root.findByType(threeDrei.Line);
    const material = fill?.findByType(MeshBasicMaterial);
    const attributes = fill?.findAllByType(BufferAttribute);

    expect(fill?.props.renderOrder).toEqual(RenderOrder.default);
    expect(line.props.renderOrder).toEqual(RenderOrder.default);
    expect(attributes?.map(attribute => attribute.props.attach))
      .toEqual(expect.arrayContaining(["index", "attributes-position"]));
    expect(material?.props).toEqual(expect.objectContaining({
      color: "white",
      transparent: true,
      opacity: 0.3,
      depthTest: true,
      depthWrite: false,
      side: DoubleSide,
    }));
    unmountRenderer(wrapper);
  });

  it("renders completed controls and popup actions", () => {
    const lineSpy = mockLine();
    const handleSpy = jest.spyOn(controls, "ControlHandle")
      .mockImplementation(props => {
        const state = { hovered: false, pressed: false, dragging: false };
        const children = typeof props.children == "function"
          ? props.children(state)
          : props.children;
        const dragEvent = {
          point: new Vector3(50, 0, 0),
          delta: new Vector3(50, 0, 0),
        } as controls.ControlDragEvent;
        return <button
          type={"button"}
          data-testid={props.name}
          onClick={() => {
            props.onDragStart?.(dragEvent);
            props.onDrag?.(dragEvent);
          }}>
          {children}
        </button>;
      });
    const arrowSpy = jest.spyOn(controls, "ControlArrow")
      .mockImplementation(props => <i
        data-testid={props.name}
        data-color={props.color}
        data-heads={props.heads}
        data-start={JSON.stringify(props.start)}
        data-end={JSON.stringify(props.end)} />);
    const selectSpy = jest.spyOn(ui, "FBSelect")
      .mockImplementation(((props: React.ComponentProps<typeof ui.FBSelect>) =>
        <select
          aria-label={"selection-type"}
          value={String(props.selectedItem?.value)}
          onChange={event => {
            const item = props.list.find(item =>
              String(item.value) == event.currentTarget.value);
            item && props.onChange(item);
          }}>
          {props.list.map(item => <option
            key={String(item.value)}
            value={String(item.value)}>
            {item.label}
          </option>)}
        </select>) as never);
    const p = props();
    p.selectedCount = 3;
    p.selection = {
      phase: "complete",
      pointType: "Plant",
      box: { x0: 100, y0: 200, x1: 500, y1: 600 },
    };
    const { rerender } = render(
      <GardenAreaSelectionOverlay {...p} />,
    );
    expect(screen.getByTestId("area-selection-rectangle"))
      .toBeInTheDocument();
    expect(screen.getByTestId("area-selection-rectangle"))
      .toHaveAttribute("data-line-width", "2");
    expect(screen.getAllByTestId(/area-selection-.*-control/))
      .toHaveLength(4);
    const arrows = screen.getAllByTestId(/area-selection-.*-arrow/);
    expect(arrows).toHaveLength(4);
    arrows.forEach(arrow => {
      expect(arrow).toHaveAttribute("data-color", "dodgerblue");
      expect(arrow).toHaveAttribute("data-heads", "end");
      expect(arrow).toHaveAttribute("data-start", "[0,0,0]");
    });
    expect(screen.getByTestId("area-selection-x0-arrow"))
      .toHaveAttribute("data-end", "[-100,0,0]");
    expect(screen.getByTestId("area-selection-x1-arrow"))
      .toHaveAttribute("data-end", "[100,0,0]");
    expect(screen.getByTestId("area-selection-y0-arrow"))
      .toHaveAttribute("data-end", "[0,-100,0]");
    expect(screen.getByTestId("area-selection-y1-arrow"))
      .toHaveAttribute("data-end", "[0,100,0]");
    expect(screen.getByRole("heading", { name: "3 plants" }))
      .toBeInTheDocument();
    expect(screen.getByLabelText("selection-type")).toHaveValue("Plant");

    fireEvent.click(screen.getByTestId("area-selection-x0-control"));
    fireEvent.change(screen.getByLabelText("selection-type"), {
      target: { value: "Weed" },
    });
    fireEvent.change(screen.getByLabelText("selection-type"), {
      target: { value: "All" },
    });
    fireEvent.click(screen.getByTitle("open panel"));
    fireEvent.click(screen.getByTitle("Delete"));
    fireEvent.click(screen.getByTitle("Create group"));
    fireEvent.click(screen.getByTitle("close"));
    expect(p.onPointTypeChange).toHaveBeenCalledWith("Weed");
    expect(p.onPointTypeChange).toHaveBeenCalledWith("All");
    expect(p.onBoxChange).toHaveBeenCalledWith({
      x0: 150, y0: 200, x1: 500, y1: 600,
    });
    expect(p.onOpenPanel).toHaveBeenCalled();
    expect(p.onDelete).toHaveBeenCalled();
    expect(p.onCreateGroup).toHaveBeenCalled();
    expect(p.onClose).toHaveBeenCalled();
    rerender(<GardenAreaSelectionOverlay
      {...p}
      config={{ ...p.config, mirrorX: true, mirrorY: true }} />);
    expect(screen.getByTestId("area-selection-x0-arrow"))
      .toHaveAttribute("data-end", "[100,0,0]");
    expect(screen.getByTestId("area-selection-y1-arrow"))
      .toHaveAttribute("data-end", "[0,-100,0]");
    handleSpy.mockRestore();
    arrowSpy.mockRestore();
    selectSpy.mockRestore();
    lineSpy.mockRestore();
  });
});

describe("<GroupAreaSelectionOverlay />", () => {
  const soilSurfaceTriangles = precomputeTriangles([
    [0, 0, -100],
    [1000, 0, -100],
    [1000, 800, -100],
    [0, 800, -100],
  ], [0, 1, 2, 0, 2, 3]);

  it("previews edge movement and commits once at drag end", () => {
    const onBoxChange = jest.fn();
    const config = { ...clone(INITIAL), botSizeX: 1000, botSizeY: 800 };
    const getZ = () => -100;
    const wrapper = createRenderer(<GroupAreaSelectionOverlay
      box={{ x0: 100, y0: 200, x1: 500, y1: 600 }}
      config={config}
      getZ={getZ}
      onBoxChange={onBoxChange}
      soilSurfaceTriangles={soilSurfaceTriangles} />);
    const handle = wrapper.root.findAllByType(controls.ControlHandle)
      .find(node => node.props.name == "area-selection-x0-control");
    if (!handle) { throw new Error("X0 control not found"); }
    const event = {
      point: new Vector3(50, 0, 0),
      delta: new Vector3(50, 0, 0),
    } as controls.ControlDragEvent;
    actRenderer(() => handle.props.onDragStart(event));
    actRenderer(() => handle.props.onDrag(event));
    expect(onBoxChange).not.toHaveBeenCalled();
    actRenderer(() => handle.props.onDragEnd(event));
    expect(onBoxChange).toHaveBeenCalledTimes(1);
    expect(onBoxChange).toHaveBeenCalledWith({
      x0: 150, y0: 200, x1: 500, y1: 600,
    });
    const committedPosition = [...handle.props.position];
    actRenderer(() => wrapper.update(<GroupAreaSelectionOverlay
      box={{ x0: 200, y0: 250, x1: 550, y1: 650 }}
      config={config}
      getZ={getZ}
      onBoxChange={onBoxChange}
      soilSurfaceTriangles={soilSurfaceTriangles} />));
    const updatedHandle = wrapper.root.findAllByType(controls.ControlHandle)
      .find(node => node.props.name == "area-selection-x0-control");
    expect(updatedHandle?.props.position).not.toEqual(committedPosition);
    unmountRenderer(wrapper);
  });
});
