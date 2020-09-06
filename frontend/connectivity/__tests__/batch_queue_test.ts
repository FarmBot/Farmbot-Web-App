jest.mock("../connect_device", () => ({
  bothUp: jest.fn(),
  batchInitResources: jest.fn(() => ({ type: "NOOP", payload: undefined }))
}));

const mockThrottleStatus = { value: false };
jest.mock("../device_is_throttled", () => ({
  deviceIsThrottled: jest.fn(() => mockThrottleStatus.value),
}));

import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../redux/store", () => ({
  store: {
    getState: () => mockState,
    dispatch: jest.fn(),
  },
}));

import { BatchQueue } from "../batch_queue";
import { fakeLog } from "../../__test_support__/fake_state/resources";
import { bothUp, batchInitResources } from "../connect_device";
import { deviceIsThrottled } from "../device_is_throttled";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";

describe("BatchQueue", () => {
  it("calls bothUp() to track network connectivity", () => {
    mockThrottleStatus.value = false;
    const device = fakeDevice();
    mockState.resources = buildResourceIndex([device]);
    const q = new BatchQueue(1);
    const log = fakeLog();
    q.push(log);
    q.maybeWork();
    expect(deviceIsThrottled).toHaveBeenCalledWith(device.body);
    expect(bothUp).toHaveBeenCalled();
    expect(batchInitResources).toHaveBeenCalledWith([log]);
  });

  it("handles missing device", () => {
    mockThrottleStatus.value = false;
    mockState.resources = buildResourceIndex([]);
    const q = new BatchQueue(1);
    const log = fakeLog();
    q.push(log);
    q.maybeWork();
    expect(deviceIsThrottled).toHaveBeenCalledWith(undefined);
    expect(bothUp).toHaveBeenCalled();
    expect(batchInitResources).toHaveBeenCalledWith([log]);
  });

  it("does nothing when throttled", () => {
    mockThrottleStatus.value = true;
    const q = new BatchQueue(1);
    q.push(fakeLog());
    q.maybeWork();
    expect(bothUp).toHaveBeenCalled();
    expect(batchInitResources).not.toHaveBeenCalled();
  });
});
