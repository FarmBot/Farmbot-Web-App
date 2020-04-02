const mockDevice = {
  setUserEnv: jest.fn(() => Promise.resolve({})),
  execScript: jest.fn(() => Promise.resolve({}))
};
jest.mock("../../../device", () => {
  return {
    getDevice: () => (mockDevice)
  };
});

let mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
let mockDelete = Promise.resolve();
jest.mock("axios", () => ({
  post: jest.fn(() => Promise.resolve({ data: mockData })),
  delete: jest.fn(() => mockDelete),
}));

const mockInc = jest.fn();
const mockFinish = jest.fn();
jest.mock("../../../util", () => ({
  Progress: () => ({ inc: mockInc, finish: mockFinish }),
  trim: jest.fn(x => x),
}));

import { deletePoints } from "../actions";
import { scanImage, detectPlants } from "../actions";
import axios from "axios";
import { API } from "../../../api";
import { times } from "lodash";
import { Actions } from "../../../constants";
import { error, success } from "../../../toast/toast";

describe("scanImage()", () => {
  it("calls out to the device", () => {
    // Run function to invoke side effects
    const thunk = scanImage(5);
    thunk();
    // Ensure the side effects were the ones we expected.
    expect(mockDevice.execScript)
      .toHaveBeenCalledWith("historical-plant-detection", [{
        args: { label: "PLANT_DETECTION_selected_image", value: "5" },
        kind: "pair"
      }]);
  });
});

describe("detectPlants()", () => {
  it("calls out to the device", () => {
    // Run function to invoke side effects
    const thunk = detectPlants();
    thunk();
    // Ensure the side effects were the ones we expected.
    expect(mockDevice.execScript)
      .toHaveBeenCalledWith("plant-detection");
  });
});

describe("deletePoints()", () => {
  API.setBaseUrl("");

  it("deletes points", async () => {
    mockDelete = Promise.resolve();
    mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const dispatch = jest.fn();
    const query = { meta: { created_by: "plant-detection" } };
    await deletePoints("weeds", query)(dispatch, jest.fn());
    expect(axios.post).toHaveBeenCalledWith("http://localhost/api/points/search",
      { meta: { created_by: "plant-detection" } });
    await expect(axios.delete).toHaveBeenCalledWith("http://localhost/api/points/1,2,3");
    await expect(error).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      payload: [1, 2, 3],
      type: Actions.DELETE_POINT_OK
    });
    expect(mockInc).toHaveBeenCalledTimes(2);
    expect(mockFinish).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledWith("Deleted 3 weeds");
  });

  it("can't delete points", async () => {
    mockDelete = Promise.reject("error");
    mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const dispatch = jest.fn();
    const query = { meta: { created_by: "plant-detection" } };
    await deletePoints("weeds", query)(dispatch, jest.fn());
    expect(axios.post).toHaveBeenCalledWith("http://localhost/api/points/search",
      { meta: { created_by: "plant-detection" } });
    await expect(axios.delete).toHaveBeenCalledWith("http://localhost/api/points/1,2,3");
    await expect(dispatch).not.toHaveBeenCalled();
    await expect(mockInc).toHaveBeenCalledTimes(1);
    expect(mockFinish).toHaveBeenCalledTimes(1);
    expect(success).not.toHaveBeenCalledWith();
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "Some weeds failed to delete."));
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "Are they in use by sequences?"));
  });

  it("chunks points", async () => {
    mockDelete = Promise.resolve();
    mockData = times(200, () => ({ id: 1 }));
    const dispatch = jest.fn();
    const query = { meta: { created_by: "plant-detection" } };
    await deletePoints("weeds", query)(dispatch, jest.fn());
    expect(axios.post).toHaveBeenCalledWith("http://localhost/api/points/search",
      { meta: { created_by: "plant-detection" } });
    await expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining("http://localhost/api/points/1,"));
    await expect(error).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      payload: expect.arrayContaining([1]),
      type: Actions.DELETE_POINT_OK
    });
    expect(mockInc).toHaveBeenCalledTimes(3);
    expect(mockFinish).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledWith("Deleted 200 weeds");
  });
});
