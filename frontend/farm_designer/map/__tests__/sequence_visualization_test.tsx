import {
  fakeToolSlot, fakePoint,
} from "../../../__test_support__/fake_state/resources";

import { fakeVariableNameSet } from "../../../__test_support__/fake_variables";
import * as selectors from "../../../resources/selectors";
import * as sequenceMeta from "../../../resources/sequence_meta";

import React from "react";
import {
  SequenceVisualization, SequenceVisualizationProps, hoverSequenceStep,
} from "../../../farm_designer/map/sequence_visualization";
import {
  fakeMapTransformProps,
} from "../../../__test_support__/map_transform_props";
import { svgMount } from "../../../__test_support__/svg_mount";
import { TaggedToolSlotPointer, MoveAbsolute } from "farmbot";
import { Actions } from "../../../constants";
import { maybeTagStep, getStepTag } from "../../../resources/sequence_tagging";
import { SequenceMeta } from "../../../resources/sequence_meta";
import { Path } from "../../../internal_urls";

let mockToolSlot: TaggedToolSlotPointer | undefined = fakeToolSlot();
let mockVariable = fakeVariableNameSet("var").var;
let findPointerByTypeAndIdSpy: jest.SpyInstance;
let findSlotByToolIdSpy: jest.SpyInstance;
let selectAllPlantPointersSpy: jest.SpyInstance;
let findUuidSpy: jest.SpyInstance;
let findVariableByNameSpy: jest.SpyInstance;

beforeEach(() => {
  mockToolSlot = fakeToolSlot();
  mockVariable = fakeVariableNameSet("var").var;
  findPointerByTypeAndIdSpy = jest.spyOn(selectors, "findPointerByTypeAndId")
    .mockImplementation(() => fakePoint());
  findSlotByToolIdSpy = jest.spyOn(selectors, "findSlotByToolId")
    .mockImplementation(() => mockToolSlot);
  selectAllPlantPointersSpy = jest.spyOn(selectors, "selectAllPlantPointers")
    .mockImplementation(() => []);
  findUuidSpy = jest.spyOn(selectors, "findUuid")
    .mockImplementation(jest.fn());
  findVariableByNameSpy = jest.spyOn(sequenceMeta, "findVariableByName")
    .mockImplementation(() => mockVariable);
});

afterEach(() => {
  findPointerByTypeAndIdSpy.mockRestore();
  findSlotByToolIdSpy.mockRestore();
  selectAllPlantPointersSpy.mockRestore();
  findUuidSpy.mockRestore();
  findVariableByNameSpy.mockRestore();
});

const moveAbsolute =
  (location: MoveAbsolute["args"]["location"]): MoveAbsolute => ({
    kind: "move_absolute",
    args: {
      location,
      offset: { kind: "coordinate", args: { x: 1, y: 1, z: 1 } },
      speed: 100,
    }
  });

describe("<SequenceVisualization />", () => {
  const elementCount = (container: HTMLElement, selector: string) =>
    container.querySelectorAll(selector).length;

  const fakeProps = (): SequenceVisualizationProps => ({
    visualizedSequenceUUID: undefined,
    visualizedSequenceBody: [],
    hoveredSequenceStep: undefined,
    mapTransformProps: fakeMapTransformProps(),
    botPosition: { x: undefined, y: undefined, z: undefined },
    zoomLvl: 1,
    dispatch: jest.fn(),
  });

  it("renders visualization", () => {
    const p = fakeProps();
    p.visualizedSequenceUUID = "uuid";
    p.visualizedSequenceBody = [
      { kind: "move_relative", args: { x: 10, y: 10, z: 0, speed: 100 } },
      { kind: "move", args: {} },
      moveAbsolute({ kind: "coordinate", args: { x: 10, y: 10, z: 0 } }),
      moveAbsolute({
        kind: "point",
        args: { pointer_id: 1, pointer_type: "Plant" },
      }),
      moveAbsolute({ kind: "tool", args: { tool_id: 1 } }),
      moveAbsolute({ kind: "identifier", args: { label: "" } }),
      { kind: "home", args: { axis: "all", speed: 100 } },
      { kind: "home", args: { axis: "x", speed: 100 } },
      { kind: "home", args: { axis: "y", speed: 100 } },
      { kind: "home", args: { axis: "z", speed: 100 } },
      { kind: "find_home", args: { axis: "all", speed: 100 } },
      { kind: "calibrate", args: { axis: "all" } },
      { kind: "take_photo", args: {} },
      { kind: "power_off", args: {} },
    ];
    p.visualizedSequenceBody.map(step => maybeTagStep(step));
    const wrapper = svgMount(<SequenceVisualization {...p} />);
    expect(elementCount(wrapper.container, "circle")).toEqual(11);
    expect(elementCount(wrapper.container, "line")).toEqual(11);
    expect(elementCount(wrapper.container, "image")).toEqual(11);
  });

  it("doesn't find tool slot", () => {
    mockToolSlot = undefined;
    const p = fakeProps();
    p.visualizedSequenceBody = [
      moveAbsolute({ kind: "tool", args: { tool_id: 1 } }),
    ];
    p.visualizedSequenceBody.map(step => maybeTagStep(step));
    const wrapper = svgMount(<SequenceVisualization {...p} />);
    expect(elementCount(wrapper.container, "circle")).toEqual(0);
    expect(elementCount(wrapper.container, "line")).toEqual(0);
    expect(elementCount(wrapper.container, "image")).toEqual(0);
  });

  it("doesn't find variable", () => {
    mockVariable = undefined;
    const p = fakeProps();
    p.visualizedSequenceUUID = "uuid";
    p.visualizedSequenceBody = [
      moveAbsolute({ kind: "identifier", args: { label: "" } }),
    ];
    p.visualizedSequenceBody.map(step => maybeTagStep(step));
    const wrapper = svgMount(<SequenceVisualization {...p} />);
    expect(elementCount(wrapper.container, "circle")).toEqual(0);
    expect(elementCount(wrapper.container, "line")).toEqual(0);
    expect(elementCount(wrapper.container, "image")).toEqual(0);
  });

  it("doesn't find variable vector", () => {
    const variable: SequenceMeta = {
      celeryNode: {
        kind: "parameter_application",
        args: {
          label: "",
          data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
        }
      },
      dropdown: { label: "", value: "" },
      vector: undefined,
    };
    mockVariable = variable;
    const p = fakeProps();
    p.visualizedSequenceBody = [
      moveAbsolute({ kind: "identifier", args: { label: "" } }),
    ];
    p.visualizedSequenceBody.map(step => maybeTagStep(step));
    const wrapper = svgMount(<SequenceVisualization {...p} />);
    expect(elementCount(wrapper.container, "circle")).toEqual(0);
    expect(elementCount(wrapper.container, "line")).toEqual(0);
    expect(elementCount(wrapper.container, "image")).toEqual(0);
  });

  it("shows hover", () => {
    const p = fakeProps();
    p.visualizedSequenceBody = [
      moveAbsolute({ kind: "coordinate", args: { x: 10, y: 10, z: 0 } }),
    ];
    p.visualizedSequenceBody.map(step => maybeTagStep(step));
    p.hoveredSequenceStep = getStepTag(p.visualizedSequenceBody[0]);
    const wrapper = svgMount(<SequenceVisualization {...p} />);
    const circle = wrapper.container.querySelector("circle");
    const line = wrapper.container.querySelector("line");
    const image = wrapper.container.querySelector("image");
    expect(elementCount(wrapper.container, "circle")).toEqual(1);
    expect(circle?.getAttribute("fill-opacity")).toEqual("1");
    expect(elementCount(wrapper.container, "line")).toEqual(1);
    expect(line?.getAttribute("stroke-opacity")).toEqual("1");
    expect(elementCount(wrapper.container, "image")).toEqual(1);
    expect(image?.getAttribute("opacity")).toEqual("1");
  });
});

describe("hoverSequenceStep()", () => {
  it("sets hovered step", () => {
    location.pathname = Path.mock(Path.designerSequences("1"));
    const dispatch = jest.fn();
    hoverSequenceStep("uuid")(dispatch)();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_SEQUENCE_STEP,
      payload: "uuid",
    });
  });

  it("doesn't set hovered step", () => {
    location.pathname = Path.mock(Path.sequencePage("1"));
    const dispatch = jest.fn();
    hoverSequenceStep("uuid")(dispatch)();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
