import React from "react";
import { ToolSlotLayer, ToolSlotLayerProps } from "../tool_slot_layer";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { fakeResource } from "../../../../../__test_support__/fake_resource";
import { ToolSlotPointer } from "farmbot/dist/resources/api_resources";
import { TaggedToolSlotPointer } from "farmbot";
import { Path } from "../../../../../internal_urls";
import { fireEvent, render } from "@testing-library/react";

describe("<ToolSlotLayer/>", () => {
  function fakeProps(): ToolSlotLayerProps {
    const ts: ToolSlotPointer = {
      pointer_type: "ToolSlot",
      tool_id: undefined,
      name: "Name",
      x: 1,
      y: 2,
      z: 3,
      meta: {},
      pullout_direction: 0,
      gantry_mounted: false,
    };
    const toolSlot: TaggedToolSlotPointer = fakeResource("Point", ts);
    return {
      visible: false,
      slots: [{ toolSlot, tool: undefined }],
      botPositionX: undefined,
      mapTransformProps: fakeMapTransformProps(),
      dispatch: jest.fn(),
      hoveredToolSlot: undefined,
      interactions: true,
      currentPoint: undefined,
      animate: false,
    };
  }

  const renderLayer = (props: ToolSlotLayerProps) =>
    render(<svg><ToolSlotLayer {...props} /></svg>);

  const pointCount = (container: HTMLElement) =>
    Array.from(container.querySelectorAll("[id^=\"toolslot-\"]"))
      .filter(el => el.id !== "toolslot-layer").length;

  it("toggles visibility off", () => {
    const { container } = renderLayer(fakeProps());
    expect(pointCount(container)).toEqual(0);
  });

  it("toggles visibility on", () => {
    const p = fakeProps();
    p.visible = true;
    const { container } = renderLayer(p);
    expect(pointCount(container)).toEqual(1);
  });

  it("doesn't navigate to tools page", async () => {
    location.pathname = Path.mock(Path.plants(1));
    const p = fakeProps();
    const { container } = renderLayer(p);
    const tools = container.querySelector("g");
    if (!tools) { throw new Error("Missing tool slot layer"); }
    await fireEvent.click(tools);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("is in clickable mode", () => {
    location.pathname = Path.mock(Path.cropSearch("mint/add"));
    const p = fakeProps();
    p.interactions = true;
    const { container } = renderLayer(p);
    const layer = container.querySelector("#toolslot-layer");
    if (!layer) { throw new Error("Missing tool slot layer"); }
    expect((layer as HTMLElement).style.cursor).toEqual("pointer");
  });

  it("is in non-clickable mode", () => {
    location.pathname = Path.mock(Path.cropSearch("mint/add"));
    const p = fakeProps();
    p.interactions = false;
    const { container } = renderLayer(p);
    const layer = container.querySelector("#toolslot-layer");
    if (!layer) { throw new Error("Missing tool slot layer"); }
    expect((layer as HTMLElement).style.pointerEvents).toEqual("none");
  });
});
