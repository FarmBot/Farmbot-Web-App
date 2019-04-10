import {
  fakeFbosConfig, fakeImage, fakeFarmwareEnv
} from "../../__test_support__/fake_state/resources";

let mockFbosConfig: TaggedFbosConfig | undefined = fakeFbosConfig();
const mockImages: TaggedImage | undefined = fakeImage();

jest.mock("../../resources/selectors_by_kind", () => ({
  selectAllFarmEvents: () => [],
  selectAllRegimens: () => [],
  selectAllLogs: () => [],
  selectAllImages: () => [mockImages],
  selectAllFarmwareEnvs: () => [fakeFarmwareEnv()]
}));

jest.mock("../../resources/getters", () => ({
  getFbosConfig: () => mockFbosConfig,
  getFirmwareConfig: () => undefined,
  getWebAppConfig: jest.fn(),
}));

import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { TaggedFbosConfig, TaggedImage } from "farmbot";
import { DevSettings } from "../../account/dev/dev_support";

describe("mapStateToProps()", () => {
  it("uses the API as the source of FBOS settings", () => {
    const fakeApiConfig = fakeFbosConfig();
    fakeApiConfig.body.auto_sync = true;
    fakeApiConfig.body.api_migrated = true;
    mockFbosConfig = fakeApiConfig;
    const props = mapStateToProps(fakeState());
    expect(props.sourceFbosConfig("auto_sync")).toEqual({
      value: true, consistent: false
    });
  });

  it("uses the bot as the source of FBOS settings", () => {
    const state = fakeState();
    state.bot.hardware.configuration.auto_sync = false;
    mockFbosConfig = undefined;
    const props = mapStateToProps(state);
    expect(props.sourceFbosConfig("auto_sync")).toEqual({
      value: false, consistent: true
    });
  });

  it("uses the bot as the source of FBOS settings: ignore API defaults", () => {
    const state = fakeState();
    state.bot.hardware.configuration.auto_sync = false;
    const fakeApiConfig = fakeFbosConfig();
    fakeApiConfig.body.auto_sync = true;
    fakeApiConfig.body.api_migrated = false;
    mockFbosConfig = fakeApiConfig;
    const props = mapStateToProps(state);
    expect(props.sourceFbosConfig("auto_sync")).toEqual({
      value: false, consistent: true
    });
  });

  it("returns API Farmware env vars", () => {
    const state = fakeState();
    state.bot.hardware.user_env = {};
    state.bot.hardware.informational_settings.controller_version =
      DevSettings.MAX_FBOS_VERSION_OVERRIDE;
    const props = mapStateToProps(state);
    expect(props.env).toEqual({
      fake_FarmwareEnv_key: "fake_FarmwareEnv_value"
    });
  });
});
