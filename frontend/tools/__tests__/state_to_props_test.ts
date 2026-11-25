import { fakeState } from "../../__test_support__/fake_state";
import {
  fakeTool, fakeToolSlot,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { mapStateToProps } from "../state_to_props";

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const toolSlot = fakeToolSlot();
    toolSlot.body.tool_id = 42;
    state.resources = buildResourceIndex([
      fakeDevice(), toolSlot,
    ]);
    const props = mapStateToProps(state);
    expect(props.isActive(undefined)).toBeFalsy();
    expect(props.isActive(42)).toBeTruthy();
  });

  it("finds a tool by its id", () => {
    const state = fakeState();
    const tool = fakeTool();
    tool.body.id = 1;
    state.resources = buildResourceIndex([tool, fakeDevice()]);
    const props = mapStateToProps(state);
    expect(props.findTool(tool.body.id)).toEqual(tool);
  });
});
