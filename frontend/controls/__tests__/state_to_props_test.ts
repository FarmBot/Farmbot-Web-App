import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import {
  fakeWebAppConfig, fakeFbosConfig,
} from "../../__test_support__/fake_state/resources";
import { mapStateToProps } from "../state_to_props";

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const config = fakeWebAppConfig();
    config.body.busy_log = 1;
    state.resources = buildResourceIndex([config]);
    const props = mapStateToProps(state);
    expect(props.firmwareSettings).toEqual({
      encoder_enabled_x: 1,
      encoder_enabled_y: 1,
      encoder_enabled_z: 0,
    });
    expect(props.getConfigValue("busy_log")).toEqual(1);
    expect(props.firmwareHardware).toEqual(undefined);
  });

  it("returns valid firmware value", () => {
    const state = fakeState();
    const config = fakeFbosConfig();
    config.body.firmware_hardware = "arduino";
    state.resources = buildResourceIndex([config]);
    expect(mapStateToProps(state).firmwareHardware).toEqual("arduino");
  });
});
