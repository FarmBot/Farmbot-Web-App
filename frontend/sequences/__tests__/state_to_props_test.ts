import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import {
  fakeSequence, fakeWebAppConfig, fakeFarmwareEnv, fakeFarmwareInstallation,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { TaggedSequence } from "farmbot";
import { fakeFarmwareManifestV2 } from "../../__test_support__/fake_farmwares";
import { BooleanSetting } from "../../session_keys";

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const config = fakeWebAppConfig();
    config.body.show_pins = true;
    state.resources = buildResourceIndex([config]);
    const props = mapStateToProps(state);
    expect(props.sequence).toEqual(undefined);
    expect(props.syncStatus).toEqual("unknown");
    expect(props.getWebAppConfigValue(BooleanSetting.show_pins)).toEqual(true);
  });

  it("checks for step tags: ok", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "wait", args: { milliseconds: 100 } }];
    const state = fakeState();
    state.resources = buildResourceIndex([sequence]);
    state.resources.consumers.sequences.current = sequence.uuid;
    expect(() => mapStateToProps(state)).not.toThrow();
    const props = mapStateToProps(state);
    expect(props.sequence).toEqual(expect.objectContaining({
      uuid: sequence.uuid,
      body: expect.objectContaining({
        body: [expect.objectContaining({
          kind: "wait", args: { milliseconds: 100 },
          uuid: expect.any(String)
        })]
      })
    }));
  });

  it("checks for step tags: error", () => {
    const sequence = fakeSequence();
    const state = fakeState();
    state.resources = buildResourceIndex([sequence]);
    state.resources.consumers.sequences.current = sequence.uuid;
    (state.resources.index.references[sequence.uuid] as TaggedSequence).body.body =
      [{ kind: "wait", args: { milliseconds: 100 } }];
    expect(() => mapStateToProps(state)).toThrow(/No tag on step/);
  });

  it("returns farmwareNames", () => {
    const state = fakeState();
    const farmwareInstallation1 = fakeFarmwareInstallation();
    farmwareInstallation1.body.package = "farmware installation";
    farmwareInstallation1.body.url = "a";
    farmwareInstallation1.body.id = 1;
    const farmwareInstallation2 = fakeFarmwareInstallation();
    farmwareInstallation2.body.package = "My Fake Farmware";
    farmwareInstallation2.body.url = "b";
    farmwareInstallation2.body.id = 2;
    state.resources = buildResourceIndex([
      farmwareInstallation1, farmwareInstallation2,
    ]);
    state.bot.hardware.process_info.farmwares = {
      "My Fake Farmware": fakeFarmwareManifestV2()
    };
    const props = mapStateToProps(state);
    expect(props.farmwareData.farmwareNames).toEqual([
      "My Fake Farmware",
      "farmware installation",
    ]);
  });

  it("returns farmwareConfigs", () => {
    const state = fakeState();
    const manifest = fakeFarmwareManifestV2();
    manifest.config["0"] = { name: "config_1", label: "Config 1", value: "4" };
    state.bot.hardware.process_info.farmwares = { "My Fake Farmware": manifest };
    const conf = fakeWebAppConfig();
    conf.body.show_first_party_farmware = true;
    state.resources = buildResourceIndex([conf]);
    state.resources.consumers.sequences.current = undefined;
    const props = mapStateToProps(state);
    expect(props.farmwareData.farmwareNames).toEqual(["My Fake Farmware"]);
    expect(props.farmwareData.showFirstPartyFarmware).toEqual(true);
    expect(props.farmwareData.farmwareConfigs).toEqual({
      "My Fake Farmware": [{
        name: "config_1", label: "Config 1", value: "4"
      }]
    });
  });

  it("returns api props", () => {
    const state = fakeState();
    const fakeEnv = fakeFarmwareEnv();
    fakeEnv.body.key = "camera";
    fakeEnv.body.value = "NONE";
    state.resources = buildResourceIndex([fakeEnv]);
    state.bot.minOsFeatureData = { api_farmware_env: "8.0.0" };
    state.bot.hardware.informational_settings.controller_version = "8.0.0";
    const props = mapStateToProps(state);
    expect(props.farmwareData.cameraDisabled).toEqual(true);
  });
});
