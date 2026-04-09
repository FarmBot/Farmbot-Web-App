import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();

import { BatchQueue } from "../batch_queue";
import { fakeLog } from "../../__test_support__/fake_state/resources";
import * as connectDevice from "../connect_device";
import * as throttling from "../device_is_throttled";
import { store } from "../../redux/store";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";

describe("BatchQueue", () => {
  const mockThrottleStatus = { value: false };
  let bothUpSpy: jest.SpyInstance;
  let batchInitResourcesSpy: jest.SpyInstance;
  let deviceIsThrottledSpy: jest.SpyInstance;
  let getStateSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    getStateSpy = jest.spyOn(store, "getState").mockImplementation(() => mockState);
    bothUpSpy = jest.spyOn(connectDevice, "bothUp").mockImplementation(() => { });
    batchInitResourcesSpy =
      jest.spyOn(connectDevice, "batchInitResources")
        .mockImplementation(payload =>
          ({ type: "NOOP", payload }) as unknown as
            ReturnType<typeof connectDevice.batchInitResources>);
    deviceIsThrottledSpy =
      jest.spyOn(throttling, "deviceIsThrottled")
        .mockImplementation(() => mockThrottleStatus.value);
  });

  afterEach(() => {
    getStateSpy.mockRestore();
    bothUpSpy.mockRestore();
    batchInitResourcesSpy.mockRestore();
    deviceIsThrottledSpy.mockRestore();
  });

  it("calls bothUp() to track network connectivity", () => {
    mockThrottleStatus.value = false;
    const device = fakeDevice();
    mockState.resources = buildResourceIndex([device]);
    const q = new BatchQueue(1);
    const log = fakeLog();
    q.push(log);
    q.maybeWork();
    expect(deviceIsThrottledSpy).toHaveBeenCalled();
    expect(bothUpSpy).toHaveBeenCalled();
    expect(batchInitResourcesSpy).toHaveBeenCalledWith([log]);
  });

  it("handles missing device", () => {
    mockThrottleStatus.value = false;
    mockState.resources = buildResourceIndex([]);
    const q = new BatchQueue(1);
    const log = fakeLog();
    q.push(log);
    q.maybeWork();
    expect(deviceIsThrottledSpy).toHaveBeenCalledWith(undefined);
    expect(bothUpSpy).toHaveBeenCalled();
    expect(batchInitResourcesSpy).toHaveBeenCalledWith([log]);
  });

  it("does nothing when throttled", () => {
    mockThrottleStatus.value = true;
    const q = new BatchQueue(1);
    q.push(fakeLog());
    q.maybeWork();
    expect(bothUpSpy).toHaveBeenCalled();
    expect(batchInitResourcesSpy).not.toHaveBeenCalled();
  });
});
