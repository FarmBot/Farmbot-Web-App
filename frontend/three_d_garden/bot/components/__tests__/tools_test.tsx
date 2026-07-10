import * as THREE from "three";
import React from "react";
import * as threeFiber from "@react-three/fiber";
import TestRenderer from "react-test-renderer";

const mockRotation = { z: 0 };

const mockRotaryRef = () => {
  const originalUseRef = jest.requireActual("react")
    .useRef as typeof React.useRef;
  let applied = false;
  return jest.spyOn(React, "useRef").mockImplementation(initialValue => {
    if (!applied && initialValue == undefined) {
      applied = true;
      const mesh = {
        material: {
          clone: () => ({
            transparent: false,
            opacity: 1,
            needsUpdate: false,
          }),
        },
      };
      Object.setPrototypeOf(mesh, THREE.Mesh.prototype);
      return {
        current: {
          traverse: (cb: (m: {}) => void) => cb(mesh),
          rotation: mockRotation,
        },
      };
    }
    return originalUseRef(initialValue);
  });
};

import { fireEvent, render } from "@testing-library/react";
import { useGLTF } from "@react-three/drei";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import { ASSETS } from "../../../constants";
import { clone } from "lodash";
import {
  convertSlotsWithTools, Tools, ToolsProps, toolsPropsEqual,
} from "../tools";
import { getToolSlotRenderPosition } from "../tool_slot_position";
import {
  fakeTool, fakeToolSlot,
} from "../../../../__test_support__/fake_state/resources";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { Path } from "../../../../internal_urls";
import { Actions } from "../../../../constants";
import { mockDispatch } from "../../../../__test_support__/fake_dispatch";
import * as suctionAnimationModule from "../suction_animation";
import * as wateringAnimationsModule from "../watering_animations";
import * as mapUtil from "../../../../farm_designer/map/util";
import { Mode } from "../../../../farm_designer/map/interfaces";

describe("<Tools />", () => {
  let getModeSpy: jest.SpyInstance;
  let suctionAnimationSpy: jest.SpyInstance;
  let wateringAnimationsSpy: jest.SpyInstance;

  beforeEach(() => {
    getModeSpy = jest.spyOn(mapUtil, "getMode").mockReturnValue(Mode.none);
    jest.spyOn(threeFiber, "useFrame")
      .mockImplementation(((callback, _renderPriority) => {
        callback({} as never, 0, undefined);
        // eslint-disable-next-line no-null/no-null
        return null;
      }));
    suctionAnimationSpy = jest.spyOn(suctionAnimationModule, "SuctionAnimations")
      .mockImplementation((() => <></>));
    wateringAnimationsSpy = jest.spyOn(
      wateringAnimationsModule, "WateringAnimations")
      .mockImplementation((() => <></>));
  });

  afterEach(() => {
    getModeSpy.mockRestore();
    mockRotation.z = 0;
  });

  const fakeProps = (): ToolsProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
    getZ: jest.fn(),
  });

  const configuredUserTools = () => {
    const tool0 = fakeTool();
    tool0.body.id = 1;
    tool0.body.name = "soil sensor";
    const tool1 = fakeTool();
    tool1.body.id = 2;
    tool1.body.name = undefined;
    const tool2 = fakeTool();
    tool2.body.id = 3;
    tool2.body.name = "weeder";
    const tool3 = fakeTool();
    tool3.body.id = 4;
    tool3.body.name = "seeder";
    const tool5 = fakeTool();
    tool5.body.id = 6;
    tool5.body.name = "seed trough 1";
    const tool6 = fakeTool();
    tool6.body.id = 7;
    tool6.body.name = "seed trough 2";
    const toolSlot0 = fakeToolSlot();
    toolSlot0.body.tool_id = tool0.body.id;
    toolSlot0.body.pullout_direction = ToolPulloutDirection.NONE;
    const toolSlot1 = fakeToolSlot();
    toolSlot1.body.tool_id = tool1.body.id;
    toolSlot1.body.pullout_direction = ToolPulloutDirection.POSITIVE_X;
    const toolSlot2 = fakeToolSlot();
    toolSlot2.body.tool_id = tool2.body.id;
    toolSlot2.body.pullout_direction = ToolPulloutDirection.POSITIVE_Y;
    const toolSlot3 = fakeToolSlot();
    toolSlot3.body.tool_id = tool3.body.id;
    toolSlot3.body.pullout_direction = ToolPulloutDirection.NEGATIVE_X;
    const toolSlot4 = fakeToolSlot();
    toolSlot4.body.tool_id = undefined;
    toolSlot4.body.pullout_direction = ToolPulloutDirection.NEGATIVE_Y;
    const toolSlot5 = fakeToolSlot();
    toolSlot5.body.tool_id = tool5.body.id;
    toolSlot5.body.gantry_mounted = true;
    const toolSlot6 = fakeToolSlot();
    toolSlot6.body.tool_id = tool6.body.id;
    toolSlot6.body.gantry_mounted = true;
    return [
      { toolSlot: toolSlot0, tool: tool0 },
      { toolSlot: toolSlot1, tool: tool1 },
      { toolSlot: toolSlot2, tool: tool2 },
      { toolSlot: toolSlot3, tool: tool3 },
      { toolSlot: toolSlot4, tool: undefined },
      { toolSlot: toolSlot5, tool: tool5 },
      { toolSlot: toolSlot6, tool: tool6 },
    ];
  };

  const savedToolSlots = (toolNames: string[]) =>
    toolNames.map((name, index) => {
      const tool = fakeTool();
      tool.body.id = index + 1;
      tool.body.name = name;
      const toolSlot = fakeToolSlot();
      toolSlot.body.id = index + 1;
      toolSlot.body.tool_id = tool.body.id;
      toolSlot.body.y = index * 100;
      return { toolSlot, tool };
    });

  interface OpacityMetrics {
    traversals: number;
    clones: number;
    opacities: number[];
  }

  const mockOpacityNodes = (
    meshCounts: number[],
    metrics: OpacityMetrics,
  ) => (node: React.ReactElement) => {
    if (node.type == "mesh") { return new THREE.Mesh(); }
    if (node.type != "group") { return {}; }
    const meshCount = meshCounts.shift() || 0;
    const meshes = Array.from({ length: meshCount }, () => {
      const mesh = new THREE.Mesh();
      const instrumentMaterial = (material: THREE.Material) => {
        const clone = material.clone.bind(material);
        jest.spyOn(material, "clone").mockImplementation(() => {
          metrics.clones++;
          const next = clone();
          instrumentMaterial(next);
          return next;
        });
      };
      instrumentMaterial(mesh.material as THREE.Material);
      return mesh;
    });
    return {
      traverse: (callback: (child: THREE.Object3D) => void) => {
        metrics.traversals++;
        meshes.forEach(mesh => callback(mesh));
        metrics.opacities.push(
          ...meshes.map(mesh => (mesh.material as THREE.Material).opacity),
        );
      },
    };
  };

  it("renders promo tools", () => {
    const { container } = render(<Tools {...fakeProps()} />);
    expect(container).toContainHTML("toolbay5");
  });

  it("renders legacy promo toolbays in world coordinates", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const { container } = render(<Tools {...p} />);
    expect(container).toContainHTML("toolbay3");
  });

  it("keeps the promo logo out of raycasting", () => {
    let view: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      view = TestRenderer.create(<Tools {...fakeProps()} />);
    });
    const logo = view?.root.find(node => node.props.name == "toolbay5Logo");
    expect(logo?.props.raycast()).toBeUndefined();
    TestRenderer.act(() => view?.unmount());
  });

  it("renders tools in their owning frames", () => {
    const p = fakeProps();
    const stationary = render(<Tools {...p} frame={"stationary"} />);
    expect(stationary.container).toContainHTML("toolbay5");
    expect(stationary.container.querySelectorAll("[name='slot']"))
      .toHaveLength(5);
    expect(stationary.container.querySelector("[name='utm-tool']")).toBeNull();
    stationary.unmount();

    const gantry = render(<Tools {...p} frame={"gantry"} />);
    expect(gantry.container).toContainHTML("seedTrough");
    expect(gantry.container).not.toContainHTML("toolbay5");
    gantry.unmount();

    const zAxis = render(<Tools {...p} frame={"z-axis"} />);
    expect(zAxis.container.querySelector("[name='utm-tool']")).toBeTruthy();
    expect(zAxis.container.querySelector("[name='slot']")).toBeNull();
  });

  it("normalizes resource slots to explicit mount frames", () => {
    const tools = convertSlotsWithTools(configuredUserTools());
    expect(tools.filter(tool => tool.mountFrame == "stationary"))
      .toHaveLength(5);
    expect(tools.filter(tool => tool.mountFrame == "gantry"))
      .toHaveLength(2);
  });

  it("renders user tools", () => {
    const p = fakeProps();
    const useGltfMock = useGLTF as unknown as jest.Mock;
    useGltfMock.mockClear();
    p.toolSlots = configuredUserTools();
    p.mountedToolName = "weeder";
    const { container } = render(<Tools {...p} />);
    expect(container).not.toContainHTML("toolbay3");
    expect(useGltfMock).not.toHaveBeenCalledWith(ASSETS.models.toolbay3, expect.anything());
    expect(useGltfMock.mock.calls
      .filter(([url]) => url == ASSETS.models.toolbay1)).toHaveLength(4);
    expect(container).toContainHTML("soilSensor");
    expect(container).toContainHTML("weeder");
    expect(container).toContainHTML("seeder");
    expect(container).toContainHTML("seedTroughWithAssembly");
  });

  it("skips frame callbacks for non-rotary tools", () => {
    const p = fakeProps();
    p.toolSlots = savedToolSlots(["soil sensor", "weeder", "seeder"]);
    p.mountedToolName = "weeder";
    (threeFiber.useFrame as unknown as jest.Mock).mockClear();
    render(<Tools {...p} />);
    expect(threeFiber.useFrame).not.toHaveBeenCalled();
  });

  it("keeps frame callback for active rotary tool", () => {
    const p = fakeProps();
    p.config.tool = "rotaryTool";
    p.config.rotary = 1;
    p.toolSlots = undefined;
    (threeFiber.useFrame as unknown as jest.Mock).mockClear();
    render(<Tools {...p} />);
    expect(threeFiber.useFrame).toHaveBeenCalledTimes(1);
  });

  it("compares only tools inputs that affect rendering", () => {
    const previous = fakeProps();
    previous.toolSlots = configuredUserTools();
    previous.mountedToolName = "weeder";
    previous.dispatch = mockDispatch;
    const unrelatedConfig = {
      ...previous,
      config: { ...previous.config, sun: previous.config.sun + 1 },
    };
    expect(toolsPropsEqual(previous, unrelatedConfig)).toBeTruthy();
    expect(toolsPropsEqual(previous, {
      ...previous,
      mountedToolName: "seeder",
    })).toBeFalsy();
    expect(toolsPropsEqual(previous, {
      ...previous,
      configPosition: {
        ...previous.configPosition,
        x: previous.configPosition.x + 1,
      },
    })).toBeFalsy();
    expect(toolsPropsEqual(previous, {
      ...previous,
      config: { ...previous.config, mirrorX: !previous.config.mirrorX },
    })).toBeFalsy();
    expect(toolsPropsEqual(previous, {
      ...previous,
      toolSlots: configuredUserTools(),
    })).toBeFalsy();

    const gantryPrevious = {
      ...previous,
      frame: "gantry" as const,
      config: { ...previous.config, mirrorX: true },
    };
    expect(toolsPropsEqual(gantryPrevious, {
      ...gantryPrevious,
      configPosition: {
        ...gantryPrevious.configPosition,
        x: gantryPrevious.configPosition.x + 1,
      },
    })).toBeFalsy();
  });

  it("reuses static tool models while x position changes", () => {
    const p = fakeProps();
    const useGltfMock = useGLTF as unknown as jest.Mock;
    p.toolSlots = configuredUserTools();
    p.mountedToolName = "weeder";
    useGltfMock.mockClear();
    const { rerender } = render(<Tools {...p} />);
    const initialCalls = useGltfMock.mock.calls.length;
    rerender(<Tools
      {...p}
      configPosition={{ ...p.configPosition, x: p.configPosition.x + 10 }} />);
    expect(useGltfMock.mock.calls.length).toEqual(initialCalls);
  });

  it("reuses the moving seeder model across position updates", () => {
    const p = fakeProps();
    const useGltfMock = useGLTF as unknown as jest.Mock;
    p.toolSlots = [];
    p.mountedToolName = "seeder";
    useGltfMock.mockClear();
    const { rerender } = render(<Tools {...p} />);
    const initialSeederCalls = useGltfMock.mock.calls
      .filter(([url]) => url == ASSETS.models.seeder).length;

    rerender(<Tools
      {...p}
      configPosition={{ ...p.configPosition, x: p.configPosition.x + 10 }} />);

    expect(useGltfMock.mock.calls
      .filter(([url]) => url == ASSETS.models.seeder).length)
      .toEqual(initialSeederCalls);
  });

  it("updates moving tool positions during bot movement", () => {
    const p = fakeProps();
    const staticTool = fakeTool();
    staticTool.body.id = 1;
    staticTool.body.name = "soil sensor";
    const gantryTool = fakeTool();
    gantryTool.body.id = 2;
    gantryTool.body.name = "weeder";
    const staticSlot = fakeToolSlot();
    staticSlot.body.id = 1;
    staticSlot.body.tool_id = staticTool.body.id;
    staticSlot.body.x = 100;
    staticSlot.body.y = 100;
    const gantrySlot = fakeToolSlot();
    gantrySlot.body.id = 2;
    gantrySlot.body.tool_id = gantryTool.body.id;
    gantrySlot.body.y = 200;
    gantrySlot.body.gantry_mounted = true;
    p.toolSlots = [
      { toolSlot: staticSlot, tool: staticTool },
      { toolSlot: gantrySlot, tool: gantryTool },
    ];
    p.mountedToolName = "weeder";

    const { container, rerender } = render(<Tools {...p} />);
    const mountedBefore =
      container.querySelector("[name='utm-tool']")?.getAttribute("position");
    const slotsBefore = Array.from(container.querySelectorAll("[name='slot']"))
      .map(slot => slot.getAttribute("position"));
    rerender(<Tools {...p} configPosition={{
      ...p.configPosition,
      x: p.configPosition.x + 50,
      y: p.configPosition.y + 25,
      z: p.configPosition.z + 5,
    }} />);
    const mountedAfter =
      container.querySelector("[name='utm-tool']")?.getAttribute("position");
    const slotsAfter = Array.from(container.querySelectorAll("[name='slot']"))
      .map(slot => slot.getAttribute("position"));

    expect(mountedAfter).not.toEqual(mountedBefore);
    expect(slotsAfter[0]).toEqual(slotsBefore[0]);
    expect(slotsAfter[1]).not.toEqual(slotsBefore[1]);
  });

  it("uses mirrored xy position for tool slots", () => {
    const p = fakeProps();
    p.config.mirrorX = true;
    p.config.mirrorY = true;
    p.config.botSizeX = 1000;
    p.config.botSizeY = 500;
    const tool = fakeTool();
    tool.body.name = "soil sensor";
    tool.body.id = 2;
    const toolSlot = fakeToolSlot();
    toolSlot.body.x = 100;
    toolSlot.body.y = 200;
    toolSlot.body.id = 1;
    toolSlot.body.tool_id = tool.body.id;
    p.toolSlots = [{ toolSlot, tool }];
    const { container } = render(<Tools {...p} />);
    expect(container).toContainHTML("position=\"1250,460,391\"");
  });

  it("flips rendered pullout direction for mirrored axis", () => {
    const p = fakeProps();
    p.config.mirrorX = true;
    const tool = fakeTool();
    tool.body.name = "soil sensor";
    tool.body.id = 2;
    const toolSlot = fakeToolSlot();
    toolSlot.body.id = 1;
    toolSlot.body.tool_id = tool.body.id;
    toolSlot.body.pullout_direction = ToolPulloutDirection.POSITIVE_X;
    p.toolSlots = [{ toolSlot, tool }];
    const { container } = render(<Tools {...p} />);
    expect(container).toContainHTML(`rotation="0,0,${Math.PI / 2}"`);
  });

  it("uses mirrored bot x for gantry-mounted tools when mirrorX is active", () => {
    const p = fakeProps();
    p.config.mirrorX = true;
    p.configPosition.x = p.config.botSizeX - p.configPosition.x;
    const tool = fakeTool();
    tool.body.name = "soil sensor";
    tool.body.id = 2;
    const toolSlot = fakeToolSlot();
    toolSlot.body.id = 1;
    toolSlot.body.tool_id = tool.body.id;
    toolSlot.body.gantry_mounted = true;
    p.toolSlots = [{ toolSlot, tool }];
    const { container } = render(<Tools {...p} />);
    expect(container).toContainHTML("position=\"1050,-680,391\"");
  });

  it("calculates static and gantry tool slot render positions", () => {
    const config = clone(INITIAL);
    const configPosition = clone(INITIAL_POSITION);
    config.mirrorX = true;
    config.botSizeX = 1000;
    configPosition.x = 200;
    const toolSlot = fakeToolSlot();
    toolSlot.body.x = 100;
    toolSlot.body.y = 200;
    toolSlot.body.z = 30;
    expect(getToolSlotRenderPosition(config, configPosition, {
      toolSlot,
      tool: undefined,
    }).z).toEqual(421);
    toolSlot.body.gantry_mounted = true;
    expect(getToolSlotRenderPosition(config, configPosition, {
      toolSlot,
      tool: undefined,
    }).x).toEqual(550);
  });

  it("doesn't mirror gantry-mounted tool y when mirrorY is active", () => {
    const p = fakeProps();
    p.config.mirrorY = true;
    p.configPosition.y = p.config.botSizeY - p.configPosition.y;
    const tool = fakeTool();
    tool.body.name = "soil sensor";
    tool.body.id = 2;
    const toolSlot = fakeToolSlot();
    toolSlot.body.id = 1;
    toolSlot.body.tool_id = tool.body.id;
    toolSlot.body.gantry_mounted = true;
    p.toolSlots = [{ toolSlot, tool }];
    const { container } = render(<Tools {...p} />);
    expect(container).toContainHTML("position=\"-1050,-680,391\"");
  });

  it("renders vacuum animation when not in toolbay and vacuum", () => {
    const p = fakeProps();
    p.config.vacuum = true;
    const tool = fakeTool();
    tool.body.name = "seeder";
    p.toolSlots = [];
    p.mountedToolName = "seeder";
    render(<Tools {...p} />);
    expect(suctionAnimationSpy).toHaveBeenCalled();
    expect(suctionAnimationSpy).toHaveBeenCalledWith(
      expect.objectContaining({ zValues: [-50, -80, -95, -100] }),
      undefined,
    );
  });

  it.each<[number, number]>([
    [0, 0],
    [1, 10],
    [-1, -10],
  ])("renders rotary animations when not in toolbay and rotary active: %s",
    (input, expected) => {
      const useRefSpy = mockRotaryRef();
      const dateSpy = jest.spyOn(Date, "now").mockImplementation(() => 1000);
      const p = fakeProps();
      p.config.rotary = input;
      const tool = fakeTool();
      tool.body.name = "rotary tool";
      p.toolSlots = [];
      p.mountedToolName = "rotary tool";
      render(<Tools {...p} />);
      expect(mockRotation.z).toEqual(expected);
      dateSpy.mockRestore();
      useRefSpy.mockRestore();
    });

  it("doesn't render watering animations when water not flowing", () => {
    const p = fakeProps();
    p.config.waterFlow = false;
    const tool = fakeTool();
    tool.body.name = "watering nozzle";
    p.toolSlots = [];
    p.mountedToolName = "watering nozzle";
    render(<Tools {...p} />);
    expect(wateringAnimationsSpy).not.toHaveBeenCalled();
  });

  it("doesn't render watering animations when in toolbay", () => {
    const p = fakeProps();
    p.config.waterFlow = true;
    const tool = fakeTool();
    tool.body.name = "watering nozzle";
    const toolSlot = fakeToolSlot();
    toolSlot.body.tool_id = tool.body.id;
    p.toolSlots = [{ toolSlot, tool }];
    render(<Tools {...p} />);
    expect(wateringAnimationsSpy).not.toHaveBeenCalled();
  });

  it("navigates to tool info", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const tool = fakeTool();
    tool.body.name = "soil sensor";
    tool.body.id = 2;
    const toolSlot = fakeToolSlot();
    toolSlot.body.id = 1;
    toolSlot.body.tool_id = tool.body.id;
    p.toolSlots = [{ toolSlot, tool }];
    const { container } = render(<Tools {...p} />);
    const slot = container.querySelector("[name='slot']");
    slot && fireEvent.click(slot);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.toolSlots("1"));
  });

  it("selects tool slot object instead of navigating when handler is present", () => {
    const p = fakeProps();
    p.dispatch = mockDispatch(jest.fn());
    p.onSelectObject = jest.fn();
    const tool = fakeTool();
    tool.body.name = "soil sensor";
    tool.body.id = 2;
    const toolSlot = fakeToolSlot();
    toolSlot.body.id = 1;
    toolSlot.body.tool_id = tool.body.id;
    p.toolSlots = [{ toolSlot, tool }];
    let view: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      view = TestRenderer.create(<Tools {...p} />);
    });
    const draggedSlot = view?.root.findAllByProps({ name: "slot" })[0];
    draggedSlot?.props.onClick({ delta: 2, stopPropagation: jest.fn() });
    expect(p.onSelectObject).not.toHaveBeenCalled();
    TestRenderer.act(() => view?.unmount());

    const { container } = render(<Tools {...p} />);
    const slot = container.querySelector("[name='slot']");
    slot && fireEvent.click(slot);
    expect(p.onSelectObject).toHaveBeenCalledWith({ kind: "slot", id: 1 });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("selects UTM object instead of navigating when handler is present", () => {
    const p = fakeProps();
    p.toolSlots = [];
    p.onSelectObject = jest.fn();
    const { container } = render(<Tools {...p} />);
    const utm = container.querySelector("[name='utm-tool']");
    utm && fireEvent.click(utm);
    expect(p.onSelectObject).toHaveBeenCalledWith({ kind: "utm", id: 0 });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("hovers selectable tools", () => {
    const p = fakeProps();
    p.onHoverObject = jest.fn();
    p.onHoverLabel = jest.fn();
    p.toolSlots = configuredUserTools();
    p.toolSlots.forEach((slot, index) => {
      slot.toolSlot.body.id = index + 1;
    });
    const { container } = render(<Tools {...p} />);
    container.querySelectorAll("[name='slot']").forEach(slot => {
      fireEvent.pointerOver(slot);
      fireEvent.pointerOut(slot);
    });
    const utm = container.querySelector("[name='utm-tool']");
    utm && fireEvent.pointerOver(utm);
    utm && fireEvent.pointerOut(utm);
    container.querySelectorAll("group:not([name])").forEach(group => {
      fireEvent.pointerOver(group);
      fireEvent.pointerOut(group);
    });
    expect(p.onHoverObject).toHaveBeenCalledWith(true);
    expect(p.onHoverObject).toHaveBeenCalledWith(false);
    expect(p.onHoverLabel).toHaveBeenCalledWith(expect.objectContaining({
      kind: "slot",
    }));
    expect(p.onHoverLabel).toHaveBeenCalledWith(undefined);
  });

  it("navigates to tools from the mounted UTM tool", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.toolSlots = [];
    const { container } = render(<Tools {...p} />);
    const utm = container.querySelector("[name='utm-tool']");
    utm && fireEvent.click(utm);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.tools());
  });

  it("doesn't navigate to tool info", () => {
    const p = fakeProps();
    p.dispatch = undefined;
    const tool = fakeTool();
    tool.body.name = "soil sensor";
    tool.body.id = 2;
    const toolSlot = fakeToolSlot();
    toolSlot.body.id = 1;
    toolSlot.body.tool_id = tool.body.id;
    p.toolSlots = [{ toolSlot, tool }];
    const { container } = render(<Tools {...p} />);
    const slot = container.querySelector("[name='slot']");
    slot && fireEvent.click(slot);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("doesn't clone materials for initially opaque tools", () => {
    const p = fakeProps();
    p.toolSlots = savedToolSlots([
      "soil sensor",
      "weeder",
      "seeder",
      "watering nozzle",
      "rotary tool",
      "seed bin",
      "seed tray",
    ]);
    p.mountedToolName = "weeder";
    const metrics: OpacityMetrics = {
      traversals: 0,
      clones: 0,
      opacities: [],
    };
    let view: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      view = TestRenderer.create(<Tools {...p} />, {
        createNodeMock: mockOpacityNodes([
          1, // mounted UTM tool
          2, // soil sensor
          1, // mounted/faded weeder
          1, // seeder
          1, // watering nozzle
          2, // rotary tool
          1, // seed bin
          1, // seed tray
        ], metrics),
      });
    });

    expect(metrics.traversals).toEqual(1);
    expect(metrics.clones).toEqual(1);
    expect(metrics.opacities).toEqual([0.25]);

    TestRenderer.act(() => view?.unmount());
  });

  it("restores opacity when a faded tool becomes opaque", () => {
    const p = fakeProps();
    p.toolSlots = savedToolSlots(["weeder"]);
    p.mountedToolName = "weeder";
    const metrics: OpacityMetrics = {
      traversals: 0,
      clones: 0,
      opacities: [],
    };
    let view: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      view = TestRenderer.create(<Tools {...p} />, {
        createNodeMock: mockOpacityNodes([
          1, // mounted UTM tool
          1, // mounted/faded weeder
        ], metrics),
      });
    });
    TestRenderer.act(() => {
      view?.update(<Tools {...p} mountedToolName={"seeder"} />);
    });

    expect(metrics.traversals).toEqual(2);
    expect(metrics.clones).toEqual(2);
    expect(metrics.opacities).toEqual([0.25, 1]);

    TestRenderer.act(() => view?.unmount());
  });
});
