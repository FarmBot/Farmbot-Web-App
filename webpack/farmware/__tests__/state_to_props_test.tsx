jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
  initSave: jest.fn(),
}));

import { mapStateToProps, saveOrEditFarmwareEnv } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeFarmwareEnv } from "../../__test_support__/fake_state/resources";
import { edit, initSave, save } from "../../api/crud";

describe("mapStateToProps()", () => {

  it("sync status unknown", () => {
    const props = mapStateToProps(fakeState());
    expect(props.botToMqttStatus).toEqual("up");
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
    expect(props.user_env).toEqual(env);
  });

  it("returns API farmware env", () => {
    const state = fakeState();
    state.bot.hardware.user_env = {};
    state.bot.hardware.informational_settings.controller_version = "1000.0.0";
    state.resources = buildResourceIndex([fakeFarmwareEnv()]);
    const props = mapStateToProps(state);
    expect(props.user_env).toEqual({
      fake_FarmwareEnv_key: "fake_FarmwareEnv_value"
    });
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
