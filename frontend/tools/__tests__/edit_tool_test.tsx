import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import {
  RawEditTool as EditTool, mapStateToProps, isActive, WaterFlowRateInput,
  WaterFlowRateInputProps, LUA_WATER_FLOW_RATE,
  TipZOffsetInput,
  TipZOffsetInputProps,
} from "../edit_tool";
import {
  fakeTool, fakeToolSlot,
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import * as crud from "../../api/crud";
import { EditToolProps } from "../interfaces";
import * as deviceActions from "../../devices/actions";
import { Path } from "../../internal_urls";
import { NavigationContext } from "../../routes_helpers";

const renderWithContext = (element: React.ReactElement) =>
  render(
    <NavigationContext.Provider value={mockNavigate}>
      {element}
    </NavigationContext.Provider>,
  );

let editSpy: jest.SpyInstance;
let destroySpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;

describe("<EditTool />", () => {
  beforeEach(() => {
    location.pathname = Path.mock(Path.tools(1));
    editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
    destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
    saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  });

  afterEach(() => {
    editSpy.mockRestore();
    destroySpy.mockRestore();
    saveSpy.mockRestore();
  });

  const fakeProps = (): EditToolProps => ({
    findTool: jest.fn(() => fakeTool()),
    dispatch: jest.fn(),
    mountedToolId: undefined,
    isActive: jest.fn(),
    existingToolNames: [],
    saveFarmwareEnv: jest.fn(),
    env: {},
  });

  it("renders", () => {
    const { container } = renderWithContext(<EditTool {...fakeProps()} />);
    expect(container.textContent).toContain("Edit tool");
    expect(container.textContent?.toLowerCase()).not.toContain("flow rate");
  });

  it("renders watering nozzle", () => {
    const ref = React.createRef<EditTool>();
    const { container } = renderWithContext(<EditTool {...fakeProps()} ref={ref} />);
    act(() => {
      ref.current?.setState({ toolName: "watering nozzle" });
    });
    expect(container.textContent?.toLowerCase()).toContain("flow rate");
  });

  it("renders seeder", () => {
    const ref = React.createRef<EditTool>();
    const { container } = renderWithContext(<EditTool {...fakeProps()} ref={ref} />);
    act(() => {
      ref.current?.setState({ toolName: "seeder" });
    });
    expect(container.textContent?.toLowerCase()).toContain("tip z offset");
  });

  it("changes flow rate", () => {
    const ref = React.createRef<EditTool>();
    renderWithContext(<EditTool {...fakeProps()} ref={ref} />);
    act(() => {
      ref.current?.changeFlowRate(1);
    });
    expect(ref.current?.state.flowRate).toEqual(1);
  });

  it("changes tip z offset", () => {
    const ref = React.createRef<EditTool>();
    renderWithContext(<EditTool {...fakeProps()} ref={ref} />);
    act(() => {
      ref.current?.changeTipZOffset(1);
    });
    expect(ref.current?.state.tipZOffset).toEqual(1);
  });

  it("handles missing tool name", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.name = undefined;
    p.findTool = () => tool;
    const ref = React.createRef<EditTool>();
    renderWithContext(<EditTool {...p} ref={ref} />);
    expect(ref.current?.state.toolName).toEqual("");
  });

  it("redirects", () => {
    location.pathname = Path.mock(Path.tools()) + "/";
    const p = fakeProps();
    p.findTool = jest.fn(() => undefined);
    const { container } = renderWithContext(<EditTool {...p} />);
    expect(container.textContent).toContain("Redirecting...");
    expect(mockNavigate).toHaveBeenCalledWith(Path.tools());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const p = fakeProps();
    p.findTool = jest.fn(() => undefined);
    renderWithContext(<EditTool {...p} />);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("edits tool name", () => {
    const ref = React.createRef<EditTool>();
    renderWithContext(<EditTool {...fakeProps()} ref={ref} />);
    const input = document.querySelector("input[name='toolName']") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "new name" } });
    expect(ref.current?.state.toolName).toEqual("new name");
  });

  it("disables save until name in entered", () => {
    const ref = React.createRef<EditTool>();
    const { container } = renderWithContext(<EditTool {...fakeProps()} ref={ref} />);
    const saveButton = container.querySelector(".save-btn") as HTMLButtonElement;
    act(() => {
      ref.current?.setState({ toolName: "" });
    });
    expect(saveButton.disabled).toBeTruthy();
    act(() => {
      ref.current?.setState({ toolName: "fake tool name" });
    });
    expect(saveButton.disabled).toBeFalsy();
  });

  it("shows name collision message", () => {
    const p = fakeProps();
    p.existingToolNames = ["tool"];
    const { container } = renderWithContext(<EditTool {...p} />);
    const input = container.querySelector("input[name='toolName']") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "tool" } });
    expect(container.querySelector(".name-error")?.textContent)
      .toEqual("Name already taken.");
    expect((container.querySelector(".save-btn") as HTMLButtonElement)?.disabled)
      .toBeTruthy();
  });

  it("saves", () => {
    const p = fakeProps();
    const tool = fakeTool();
    p.findTool = () => tool;
    const { container } = renderWithContext(<EditTool {...p} />);
    fireEvent.click(container.querySelector(".save-btn") as Element);
    expect(crud.edit).toHaveBeenCalledWith(expect.any(Object), {
      name: "Foo",
      flow_rate_ml_per_s: 0,
      seeder_tip_z_offset: 80,
    });
    expect(crud.save).toHaveBeenCalledWith(tool.uuid);
    expect(mockNavigate).toHaveBeenCalledWith(Path.tools());
  });

  it("removes tool", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.findTool = () => tool;
    p.isActive = () => false;
    p.mountedToolId = undefined;
    const { container } = renderWithContext(<EditTool {...p} />);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
    expect(crud.destroy).toHaveBeenCalledWith(tool.uuid);
  });

  it("doesn't remove tool: active", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.findTool = () => tool;
    p.isActive = () => true;
    p.mountedToolId = undefined;
    const { container } = renderWithContext(<EditTool {...p} />);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
    expect(crud.destroy).not.toHaveBeenCalledWith(tool.uuid);
  });

  it("doesn't remove tool: mounted", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.findTool = () => tool;
    p.isActive = () => false;
    p.mountedToolId = tool.body.id;
    const { container } = renderWithContext(<EditTool {...p} />);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
    expect(crud.destroy).not.toHaveBeenCalledWith(tool.uuid);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const tool = fakeTool();
    tool.body.id = 123;
    state.resources = buildResourceIndex([tool, fakeDevice()]);
    const props = mapStateToProps(state);
    expect(props.findTool("" + tool.body.id)).toEqual(tool);
  });
});

describe("isActive()", () => {
  it("returns tool state", () => {
    const toolSlot = fakeToolSlot();
    toolSlot.body.tool_id = 1;
    const active = isActive([toolSlot]);
    expect(active(1)).toEqual(true);
    expect(active(2)).toEqual(false);
    expect(active(undefined)).toEqual(false);
  });
});

describe("<WaterFlowRateInput />", () => {
  let sendRPCSpy: jest.SpyInstance;

  beforeEach(() => {
    sendRPCSpy = jest.spyOn(deviceActions, "sendRPC")
      .mockImplementation(jest.fn());
  });

  afterEach(() => sendRPCSpy.mockRestore());

  const fakeProps = (): WaterFlowRateInputProps => ({
    value: 1,
    onChange: jest.fn(),
  });

  it("sends RPC", () => {
    const { container } = render(<WaterFlowRateInput {...fakeProps()} />);
    const button = container.querySelector(".fb-button.orange") as Element;
    fireEvent.click(button);
    expect(deviceActions.sendRPC).toHaveBeenCalledWith({
      kind: "lua", args: { lua: LUA_WATER_FLOW_RATE },
    });
  });

  it("changes value", () => {
    const p = fakeProps();
    const { container } = render(<WaterFlowRateInput {...p} />);
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "12" } });
    expect(p.onChange).toHaveBeenCalledWith(12);
  });
});

describe("<TipZOffsetInput />", () => {
  const fakeProps = (): TipZOffsetInputProps => ({
    value: 1,
    onChange: jest.fn(),
  });

  it("changes value", () => {
    const p = fakeProps();
    const { container } = render(<TipZOffsetInput {...p} />);
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "12" } });
    expect(p.onChange).toHaveBeenCalledWith(12);
  });
});
