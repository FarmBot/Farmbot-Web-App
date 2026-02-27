import React from "react";
import { cleanup, render } from "@testing-library/react";
import { RawEditToolSlot as EditToolSlot } from "../edit_tool_slot";
import { fakeState } from "../../__test_support__/fake_state";
import {
  fakeToolSlot, fakeTool,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import * as crud from "../../api/crud";
import { mapStateToPropsEdit } from "../state_to_props";
import { SlotEditRows } from "../tool_slot_edit_components";
import { fakeToolTransformProps } from "../../__test_support__/fake_tool_info";
import { EditToolSlotProps } from "../interfaces";
import * as toolGraphics from "../../farm_designer/map/layers/tool_slots/tool_graphics";
import { SpecialStatus } from "farmbot";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";
import { Path } from "../../internal_urls";
import {
  actRenderer,
  createRenderer,
  getRendererInstance,
  unmountRenderer,
} from "../../__test_support__/test_renderer";

beforeEach(() => {
  jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  jest.spyOn(crud, "save").mockImplementation(jest.fn(() => () => "mockSave"));
  jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
  jest.spyOn(toolGraphics, "setToolHover").mockImplementation(jest.fn());
  jest.spyOn(toolGraphics, "ToolSlotSVG").mockImplementation(() => <div />);
});

describe("<EditToolSlot />", () => {
  const mountedWrappers: ReturnType<typeof createRenderer>[] = [];

  afterEach(() => {
    mountedWrappers.splice(0).forEach(wrapper =>
      unmountRenderer(wrapper));
    cleanup();
  });

  const createWrapper = (p = fakeProps()) => {
    const wrapper = createRenderer(<EditToolSlot {...p} />);
    mountedWrappers.push(wrapper);
    return wrapper;
  };

  const getInstance = (wrapper: ReturnType<typeof createRenderer>) =>
    getRendererInstance<EditToolSlot>(wrapper, EditToolSlot);

  const fakeProps = (): EditToolSlotProps => ({
    findToolSlot: jest.fn(),
    tools: [],
    findTool: jest.fn(),
    botPosition: { x: undefined, y: undefined, z: undefined },
    dispatch: jest.fn(),
    firmwareHardware: undefined,
    toolTransformProps: fakeToolTransformProps(),
    isActive: jest.fn(),
    botOnline: true,
    arduinoBusy: false,
    defaultAxes: "XY",
    movementState: fakeMovementState(),
  });

  it("redirects", () => {
    location.pathname = Path.mock(Path.toolSlots("nope"));
    const { container } = render(<EditToolSlot {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("redirecting");
    expect(mockNavigate).toHaveBeenCalledWith(Path.tools());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const { container } = render(<EditToolSlot {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("redirecting");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("renders", () => {
    const p = fakeProps();
    const toolSlot = fakeToolSlot();
    toolSlot.body.meta = { meta_key: "meta value", tool_direction: "standard" };
    p.findToolSlot = () => toolSlot;
    const { container } = render(<EditToolSlot {...p} />);
    const text = container.textContent?.toLowerCase() || "";
    ["edit slot", "x (mm)", "y (mm)", "z (mm)", "tool or seed container",
      "gantry-mounted", "meta value",
    ].map(string => expect(text).toContain(string));
    expect(text.includes("direction")
      || text.includes("rotate tool 180 degrees")).toEqual(true);
    expect(text).not.toContain("standard");
    expect(container.querySelectorAll(".fa-exclamation-triangle").length)
      .toEqual(0);
  });

  it("renders save error", () => {
    const p = fakeProps();
    const toolSlot = fakeToolSlot();
    toolSlot.specialStatus = SpecialStatus.DIRTY;
    p.findToolSlot = () => toolSlot;
    const { container } = render(<EditToolSlot {...p} />);
    expect(container.querySelectorAll(".fa-exclamation-triangle").length)
      .toEqual(1);
  });

  it("unhovers tool slot on unmount", () => {
    const wrapper = createWrapper();
    unmountRenderer(wrapper);
    expect(toolGraphics.setToolHover).toHaveBeenCalledWith(undefined);
  });

  it("updates tool slot", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    const slot = fakeToolSlot();
    const wrapper = createWrapper(p);
    const instance = getInstance(wrapper);
    await actRenderer(async () => {
      instance.updateSlot(slot)({ x: 123 });
      await Promise.resolve();
    });
    expect(crud.edit).toHaveBeenCalledWith(slot, { x: 123 });
    expect(crud.save).toHaveBeenCalledWith(slot.uuid);
    expect(instance.state.saveError).toEqual(false);
  });

  it("errors while updating tool slot", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(x => x?.() == "mockSave" ? Promise.reject() : undefined);
    const slot = fakeToolSlot();
    const wrapper = createWrapper(p);
    const instance = getInstance(wrapper);
    await actRenderer(async () => {
      instance.updateSlot(slot)({ x: 123 });
      await Promise.resolve();
    });
    expect(crud.edit).toHaveBeenCalledWith(slot, { x: 123 });
    expect(crud.save).toHaveBeenCalledWith(slot.uuid);
    expect(instance.state.saveError).toEqual(true);
  });

  it("removes tool slot", () => {
    const p = fakeProps();
    const toolSlot = fakeToolSlot();
    p.findToolSlot = () => toolSlot;
    const wrapper = createWrapper(p);
    wrapper.root.findAll(node =>
      typeof node.props.className == "string"
      && node.props.className.includes("fa-trash"))[0]
      ?.props.onClick();
    expect(crud.destroy).toHaveBeenCalledWith(toolSlot.uuid);
  });

  it("finds tool", () => {
    const p = fakeProps();
    const toolSlot = fakeToolSlot();
    p.findToolSlot = () => toolSlot;
    const tool = fakeTool();
    p.findTool = () => tool;
    const wrapper = createWrapper(p);
    expect(wrapper.root.findAllByType(SlotEditRows)[0]?.props.tool).toEqual(tool);
  });
});

describe("mapStateToPropsEdit()", () => {
  it("returns props", () => {
    const tool = fakeTool();
    tool.body.id = 1;
    const toolSlot = fakeToolSlot();
    toolSlot.body.id = 1;
    const state = fakeState();
    state.resources = buildResourceIndex([tool, toolSlot]);
    const props = mapStateToPropsEdit(state);
    expect(props.findTool(1)).toEqual(tool);
    expect(props.findToolSlot("1")).toEqual(toolSlot);
  });

  it("doesn't find tool slot", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    const props = mapStateToPropsEdit(state);
    expect(props.findToolSlot("1")).toEqual(undefined);
  });
});
