let mockDestroyAllPromise: Promise<void | never> =
  Promise.reject("error").catch(() => { });
jest.mock("../../../api/crud", () => ({
  destroyAll: jest.fn(() => mockDestroyAllPromise)
}));

import React from "react";
import { mount } from "enzyme";
import { ClearFarmwareData } from "../clear_farmware_data";
import { destroyAll } from "../../../api/crud";
import { success, error } from "../../../toast/toast";

describe("<ClearFarmwareData />", () => {
  it("destroys all FarmwareEnvs", async () => {
    mockDestroyAllPromise = Promise.resolve();
    const wrapper = mount(<ClearFarmwareData />);
    wrapper.find("button").last().simulate("click");
    await expect(destroyAll).toHaveBeenCalledWith("FarmwareEnv");
    expect(success).toHaveBeenCalledWith(expect.stringContaining("deleted"));
  });

  it("fails to destroy all FarmwareEnvs", async () => {
    mockDestroyAllPromise = Promise.reject("error");
    const wrapper = mount(<ClearFarmwareData />);
    await wrapper.find("button").last().simulate("click");
    await expect(destroyAll).toHaveBeenCalledWith("FarmwareEnv");
    expect(error).toHaveBeenCalled();
  });
});
