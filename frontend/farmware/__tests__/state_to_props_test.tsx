jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
  initSave: jest.fn(),
}));

import { mapStateToProps, saveOrEditFarmwareEnv } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex
} from "../../__test_support__/resource_index_builder";
import {
  fakeFarmwareEnv, fakeFarmwareInstallation
} from "../../__test_support__/fake_state/resources";
import { edit, initSave, save } from "../../api/crud";
import { fakeFarmwareManifestV1 } from "../../__test_support__/fake_farmwares";
import { JobProgress } from "farmbot";
import { DevSettings } from "../../account/dev/dev_support";

describe("mapStateToProps()", () => {

  it("sync status unknown", () => {
    const props = mapStateToProps(fakeState());
    expect(props.botToMqttStatus).toEqual("down");
  });

  it("currentImage undefined", () => {
    const props = mapStateToProps(fakeState());
    expect(props.currentImage).toEqual(props.images[0]);
  });

  it("currentImage defined", () => {
    const state = fakeState();
    const secondImageUUID = Object.keys(state.resources.index.byKind.Image)[1];
    state.resources.consumers.farmware.currentImage = secondImageUUID;
    const props = mapStateToProps(state);
    const currentImageUUID = props.currentImage ? props.currentImage.uuid : "";
    expect(currentImageUUID).toEqual(secondImageUUID);
  });

  it("returns bot state env", () => {
    const env = { foo: "bar" };
    const state = fakeState();
    state.bot.hardware.user_env = env;
    const props = mapStateToProps(state);
    expect(props.env).toEqual(env);
  });

  it("returns API farmware env", () => {
    const state = fakeState();
    state.bot.hardware.user_env = {};
    state.bot.hardware.informational_settings.controller_version =
      DevSettings.MAX_FBOS_VERSION_OVERRIDE;
    state.resources = buildResourceIndex([fakeFarmwareEnv()]);
    const props = mapStateToProps(state);
    expect(props.env).toEqual({
      fake_FarmwareEnv_key: "fake_FarmwareEnv_value"
    });
  });

  it("includes API FarmwareInstallations", () => {
    const state = fakeState();
    state.bot.hardware.informational_settings.controller_version =
      DevSettings.MAX_FBOS_VERSION_OVERRIDE;
    const farmware1 = fakeFarmwareInstallation();
    farmware1.body.id = 2;
    const farmware2 = fakeFarmwareInstallation();
    farmware2.body.url = "farmware 2 url";
    state.resources = buildResourceIndex([farmware1, farmware2]);
    const botFarmware = fakeFarmwareManifestV1();
    botFarmware.url = farmware2.body.url;
    const botFarmwareName = "farmware_0";
    state.bot.hardware.process_info.farmwares = { [botFarmwareName]: botFarmware };
    const props = mapStateToProps(state);
    expect(props.farmwares).toEqual({
      "Unknown Farmware 2 (pending install...)":
        expect.objectContaining({
          meta: expect.objectContaining({ description: "installation pending" }),
          name: "Unknown Farmware 2 (pending install...)",
          url: "https://",
          installation_pending: true,
        }),
      [botFarmware.name]: expect.objectContaining({
        name: botFarmware.name,
        installation_pending: false,
      }),
    });
  });

  it("returns image upload job list", () => {
    const state = fakeState();
    state.bot.hardware.jobs = {
      "img1.png": {
        status: "working",
        percent: 20,
        unit: "percent",
        time: "2018-11-15 18:13:21.167440Z",
      } as JobProgress,
      "FBOS_OTA": {
        status: "working",
        percent: 10,
        unit: "percent",
        time: "2018-11-15 17:13:21.167440Z",
      } as JobProgress,
      "img2.png": {
        status: "working",
        percent: 10,
        unit: "percent",
        time: "2018-11-15 19:13:21.167440Z",
      } as JobProgress,
    };
    const props = mapStateToProps(state);
    expect(props.imageJobs).toEqual([
      {
        status: "working",
        percent: 10,
        unit: "percent",
        time: "2018-11-15 19:13:21.167440Z"
      },
      {
        status: "working",
        percent: 20,
        unit: "percent",
        time: "2018-11-15 18:13:21.167440Z"
      }]);
  });

  it("handles undefined jobs", () => {
    const state = fakeState();
    // tslint:disable-next-line:no-any
    state.bot.hardware.jobs = undefined as any;
    const props = mapStateToProps(state);
    expect(props.imageJobs).toEqual([]);
  });

  it("returns bot status", () => {
    const state = fakeState();
    state.bot.hardware.informational_settings.sync_status = "sync_now";
    state.bot.connectivity.uptime["bot.mqtt"] = {
      state: "up",
      at: (new Date()).getTime()
    };
    const props = mapStateToProps(state);
    expect(props.syncStatus).toEqual("sync_now");
    expect(props.botToMqttStatus).toEqual("up");
  });
});

describe("saveOrEditFarmwareEnv()", () => {
  it("edits env var", () => {
    const ri = buildResourceIndex([fakeFarmwareEnv()]).index;
    const uuid = Object.keys(ri.all)[0];
    const fwEnv = ri.references[uuid];
    saveOrEditFarmwareEnv(ri)("fake_FarmwareEnv_key", "new_value")(jest.fn());
    expect(edit).toHaveBeenCalledWith(fwEnv, { value: "new_value" });
    expect(save).toHaveBeenCalledWith(uuid);
  });

  it("saves new env var", () => {
    const ri = buildResourceIndex([]).index;
    saveOrEditFarmwareEnv(ri)("new_key", "new_value")(jest.fn());
    expect(initSave).toHaveBeenCalledWith("FarmwareEnv",
      { key: "new_key", value: "new_value" });
  });
});
