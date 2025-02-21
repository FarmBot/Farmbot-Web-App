jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
  initSave: jest.fn(),
}));

jest.mock("../../devices/actions", () => ({
  updateConfig: jest.fn(),
}));

import {
  saveOrEditFarmwareEnv, getEnv, generateFarmwareDictionary,
  isPendingInstallation,
} from "../state_to_props";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import {
  fakeFarmwareEnv, fakeFarmwareInstallation,
} from "../../__test_support__/fake_state/resources";
import { edit, initSave, save } from "../../api/crud";
import { fakeFarmware } from "../../__test_support__/fake_farmwares";
import { fakeState } from "../../__test_support__/fake_state";
import { updateConfig } from "../../devices/actions";

describe("getEnv()", () => {
  it("returns API farmware env", () => {
    const state = fakeState();
    state.bot.hardware.user_env = {};
    state.resources = buildResourceIndex([fakeFarmwareEnv()]);
    const gotEnv = getEnv(state.resources.index);
    expect(gotEnv).toEqual({
      fake_FarmwareEnv_key: "fake_FarmwareEnv_value"
    });
  });
});

describe("generateFarmwareDictionary()", () => {
  it("includes API FarmwareInstallations", () => {
    const state = fakeState();
    const farmware1 = fakeFarmwareInstallation();
    farmware1.body.id = 2;
    const farmware2 = fakeFarmwareInstallation();
    farmware2.body.url = "farmware 2 url";
    state.resources = buildResourceIndex([farmware1, farmware2]);
    const farmwares = generateFarmwareDictionary(state.bot, state.resources.index);
    expect(farmwares).toEqual({
      "Unknown Farmware 2 (pending install...)":
        expect.objectContaining({
          meta: expect.objectContaining({ description: "installation pending" }),
          name: "Unknown Farmware 2 (pending install...)",
          url: "https://",
          installation_pending: true,
        }),
    });
  });
});

describe("isPendingInstallation()", () => {
  it("is pending", () => {
    expect(isPendingInstallation(undefined)).toEqual(true);
    const farmware = fakeFarmware();
    farmware.installation_pending = true;
    expect(isPendingInstallation(farmware)).toEqual(true);
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

  it("doesn't edit env var", () => {
    const farmwareEnv = fakeFarmwareEnv();
    farmwareEnv.body.key = "already_exists";
    farmwareEnv.body.value = "same_value";
    const ri = buildResourceIndex([farmwareEnv]).index;
    saveOrEditFarmwareEnv(ri)("already_exists", "same_value")(jest.fn());
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("saves new env var", () => {
    const ri = buildResourceIndex([]).index;
    saveOrEditFarmwareEnv(ri)("new_key", "new_value")(jest.fn());
    expect(initSave).toHaveBeenCalledWith("FarmwareEnv",
      { key: "new_key", value: "new_value" });
  });

  it("saves new env var and updates soil height", () => {
    const ri = buildResourceIndex([]).index;
    saveOrEditFarmwareEnv(ri, true)(
      "measure_soil_height_measured_distance", "100")(jest.fn());
    expect(initSave).toHaveBeenCalledWith("FarmwareEnv",
      { key: "measure_soil_height_measured_distance", value: "100" });
    expect(updateConfig).toHaveBeenCalledWith({ soil_height: -100 });
  });
});
