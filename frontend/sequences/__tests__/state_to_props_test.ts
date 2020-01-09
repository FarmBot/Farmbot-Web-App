import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { Feature } from "../../devices/interfaces";
import { fakeFarmwareManifestV1 } from "../../__test_support__/fake_farmwares";
import {
  fakeSequence, fakeWebAppConfig, fakeFarmwareEnv
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex
} from "../../__test_support__/resource_index_builder";
import { TaggedSequence } from "farmbot";

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = fakeState();
    const returnedProps = mapStateToProps(props);
    expect(returnedProps.sequence).toEqual(undefined);
    expect(returnedProps.syncStatus).toEqual("unknown");
  });

  it("returns shouldDisplay()", () => {
    const state = fakeState();
    state.bot.hardware.informational_settings.controller_version = "2.0.0";
    state.bot.minOsFeatureData = { "jest_feature": "1.0.0" };
    const props = mapStateToProps(state);
    // tslint:disable-next-line:no-any
    expect(props.shouldDisplay("some_feature" as any)).toBeFalsy();
    expect(props.shouldDisplay(Feature.jest_feature)).toBeTruthy();
  });

  it("checks for step tags: ok", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "wait", args: { milliseconds: 100 } }];
    const state = fakeState();
    state.resources = buildResourceIndex([sequence]);
    state.resources.consumers.sequences.current = sequence.uuid;
    expect(() => mapStateToProps(state)).not.toThrowError();
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
    expect(() => mapStateToProps(state)).toThrowError(/No tag on step/);
  });

  it("returns farmwareConfigs", () => {
    const state = fakeState();
    const conf = fakeWebAppConfig();
    conf.body.show_first_party_farmware = true;
    state.resources = buildResourceIndex([conf]);
    state.resources.consumers.sequences.current = undefined;
    state.bot.hardware.process_info.farmwares = {
      "My Fake Farmware": fakeFarmwareManifestV1()
    };
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
