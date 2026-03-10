let mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
let mockDelete = Promise.resolve();
let mockPostFn = jest.fn(() => Promise.resolve({ data: mockData }));
let mockDeleteFn = jest.fn(() => mockDelete);

import axios from "axios";
import { API } from "../api";
import { times } from "lodash";
import { Actions } from "../../constants";
import { error, success } from "../../toast/toast";
const actualDeletePoints = () =>
  jest.requireActual("../delete_points");

const EXPECTED_BASE_URL = "http://localhost/api/points/";

describe("deletePoints()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    API.setBaseUrl("");
    mockPostFn = jest.fn(() => Promise.resolve({ data: mockData }));
    mockDeleteFn = jest.fn(() => mockDelete);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).post = mockPostFn;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).delete = mockDeleteFn;
  });

  it("deletes points", async () => {
    mockDelete = Promise.resolve();
    mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const dispatch = jest.fn();
    const progressCb = jest.fn();
    const query = { meta: { created_by: "plant-detection" } };
    await actualDeletePoints().deletePoints("weeds", query, progressCb)(
      dispatch, jest.fn());
    await Promise.resolve();
    expect(mockPostFn).toHaveBeenCalledWith(EXPECTED_BASE_URL + "search",
      { meta: { created_by: "plant-detection" } });
    await expect(mockDeleteFn).toHaveBeenCalledWith(EXPECTED_BASE_URL + "1,2,3");
    await expect(error).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      payload: [1, 2, 3],
      type: Actions.DELETE_POINT_OK
    });
    expect(progressCb).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledWith("Deleted 3 weeds");
  });

  it("can't delete points", async () => {
    mockDelete = Promise.reject("error");
    mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const dispatch = jest.fn();
    const progressCb = jest.fn();
    const query = { meta: { created_by: "plant-detection" } };
    await actualDeletePoints().deletePoints("weeds", query, progressCb)(
      dispatch, jest.fn());
    await Promise.resolve();
    expect(mockPostFn).toHaveBeenCalledWith(EXPECTED_BASE_URL + "search",
      { meta: { created_by: "plant-detection" } });
    await expect(mockDeleteFn).toHaveBeenCalledWith(EXPECTED_BASE_URL + "1,2,3");
    await expect(dispatch).not.toHaveBeenCalled();
    await expect(progressCb).toHaveBeenCalledTimes(1);
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
    const progressCb = jest.fn();
    const query = { meta: { created_by: "plant-detection" } };
    await actualDeletePoints().deletePoints("weeds", query, progressCb)(
      dispatch, jest.fn());
    await Promise.resolve();
    expect(mockPostFn).toHaveBeenCalledWith(EXPECTED_BASE_URL + "search",
      { meta: { created_by: "plant-detection" } });
    await expect(mockDeleteFn).toHaveBeenCalledWith(
      expect.stringContaining(EXPECTED_BASE_URL + "1,"));
    await expect(error).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      payload: expect.arrayContaining([1]),
      type: Actions.DELETE_POINT_OK
    });
    expect(progressCb).toHaveBeenCalledTimes(2);
    expect(success).toHaveBeenCalledWith("Deleted 200 weeds");
  });
});

describe("deletePointsByIds()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    API.setBaseUrl("");
    mockDeleteFn = jest.fn(() => mockDelete);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).delete = mockDeleteFn;
  });

  it("deletes points", async () => {
    mockDelete = Promise.resolve();
    await actualDeletePoints().deletePointsByIds("points", [1, 2, 3]);
    expect(mockDeleteFn).toHaveBeenCalledWith(EXPECTED_BASE_URL + "1,2,3");
    expect(error).not.toHaveBeenCalled();
    expect(success).toHaveBeenCalledWith("Deleted 3 points");
  });

  it("doesn't delete points", async () => {
    mockDelete = Promise.reject("error");
    await actualDeletePoints().deletePointsByIds("points", [1, 2, 3]);
    expect(mockDeleteFn).toHaveBeenCalledWith(EXPECTED_BASE_URL + "1,2,3");
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "Some points failed to delete."));
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "Are they in use by sequences?"));
    expect(success).not.toHaveBeenCalled();
  });
});
