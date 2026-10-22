import { fakeState } from "../../__test_support__/fake_state";
import {
  fakeWebAppConfig, fakeTool, fakeToolSlot,
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
  it.each([false, true])("uses the electronics box 3D setting: %s", enabled => {
    const state = fakeState();
    const config = fakeWebAppConfig();
    config.body.enable_3d_electronics_box_top = enabled;
    state.resources = buildResourceIndex([fakeDevice(), config]);
    expect(mapStateToProps(state).threeDimensions).toEqual(enabled);
  });

  it("returns props", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    const toolSlot = fakeToolSlot();
    toolSlot.body.tool_id = 42;
    webAppConfig.body.id = 1;
    webAppConfig.body.bot_origin_quadrant = 1;
    state.resources = buildResourceIndex([
      fakeDevice(), webAppConfig, toolSlot,
    ]);
    const props = mapStateToProps(state);
    expect([1, 2, 3, 4]).toContain(props.toolTransformProps.quadrant);
    expect(props.isActive(undefined)).toBeFalsy();
    expect(props.isActive(42)).toBeTruthy();
  });

  it("returns props: incorrect quadrant", () => {
    const state = fakeState();
    const tool = fakeTool();
    tool.body.id = 1;
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.id = 1;
    webAppConfig.body.bot_origin_quadrant = 10;
    state.resources = buildResourceIndex([tool, fakeDevice(), webAppConfig]);
    const props = mapStateToProps(state);
    expect(props.findTool(tool.body.id)).toEqual(tool);
    expect(props.toolTransformProps.quadrant).toEqual(2);
  });
});
