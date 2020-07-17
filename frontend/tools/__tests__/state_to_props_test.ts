import { fakeState } from "../../__test_support__/fake_state";
import {
  fakeWebAppConfig, fakeTool,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { mapStateToProps } from "../state_to_props";

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.bot_origin_quadrant = 1;
    state.resources = buildResourceIndex([fakeDevice(), webAppConfig]);
    const props = mapStateToProps(state);
    expect(props.toolTransformProps.quadrant).toEqual(1);
  });

  it("returns props: incorrect quadrant", () => {
    const state = fakeState();
    const tool = fakeTool();
    tool.body.id = 1;
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.bot_origin_quadrant = 10;
    state.resources = buildResourceIndex([tool, fakeDevice(), webAppConfig]);
    const props = mapStateToProps(state);
    expect(props.findTool(tool.body.id)).toEqual(tool);
    expect(props.toolTransformProps.quadrant).toEqual(2);
  });
});
