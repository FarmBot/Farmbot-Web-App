let mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
let mockDelete = Promise.resolve();
jest.mock("axios", () => ({
  post: jest.fn(() => Promise.resolve({ data: mockData })),
  delete: jest.fn(() => mockDelete),
}));

const mockInc = jest.fn();
const mockFinish = jest.fn();
jest.mock("../../util", () => ({
  Progress: () => ({ inc: mockInc, finish: mockFinish }),
  trim: jest.fn(x => x),
}));

import { deletePoints, deletePointsByIds } from "../delete_points";
import axios from "axios";
import { API } from "../api";
import { times } from "lodash";
import { Actions } from "../../constants";
import { error, success } from "../../toast/toast";

const EXPECTED_BASE_URL = "http://localhost/api/points/";

describe("deletePoints()", () => {
  API.setBaseUrl("");

  it("deletes points", async () => {
    mockDelete = Promise.resolve();
    mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const dispatch = jest.fn();
    const query = { meta: { created_by: "plant-detection" } };
    await deletePoints("weeds", query)(dispatch, jest.fn());
    expect(axios.post).toHaveBeenCalledWith(EXPECTED_BASE_URL + "search",
      { meta: { created_by: "plant-detection" } });
    await expect(axios.delete).toHaveBeenCalledWith(EXPECTED_BASE_URL + "1,2,3");
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
    expect(axios.post).toHaveBeenCalledWith(EXPECTED_BASE_URL + "search",
      { meta: { created_by: "plant-detection" } });
    await expect(axios.delete).toHaveBeenCalledWith(EXPECTED_BASE_URL + "1,2,3");
    await expect(dispatch).not.toHaveBeenCalled();
    await expect(mockInc).toHaveBeenCalledTimes(1);
    expect(mockFinish).toHaveBeenCalledTimes(1);
    expect(success).not.toHaveBeenCalled();
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
    expect(axios.post).toHaveBeenCalledWith(EXPECTED_BASE_URL + "search",
      { meta: { created_by: "plant-detection" } });
    await expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining(EXPECTED_BASE_URL + "1,"));
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

describe("deletePointsByIds()", () => {
  it("deletes points", async () => {
    mockDelete = Promise.resolve();
    await deletePointsByIds("points", [1, 2, 3]);
    expect(axios.delete).toHaveBeenCalledWith(EXPECTED_BASE_URL + "1,2,3");
    expect(error).not.toHaveBeenCalled();
    expect(success).toHaveBeenCalledWith("Deleted 3 points");
  });

  it("doesn't delete points", async () => {
    mockDelete = Promise.reject("error");
    await deletePointsByIds("points", [1, 2, 3]);
    expect(axios.delete).toHaveBeenCalledWith(EXPECTED_BASE_URL + "1,2,3");
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "Some points failed to delete."));
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "Are they in use by sequences?"));
    expect(success).not.toHaveBeenCalled();
  });
});
