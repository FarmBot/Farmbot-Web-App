const mockOn = jest.fn();

const mockConsistency = { value: true };
import * as device from "../../device";
import { store } from "../../redux/store";
import {
  startTracking, outstandingRequests, stopTracking, cleanUUID, MAX_WAIT,
} from "../data_consistency";

const unprocessedUuid = "~UU.ID~";
const niceUuid = cleanUUID(unprocessedUuid);
let getDeviceSpy: jest.SpyInstance;
let getStateSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  outstandingRequests.all.clear();
  mockConsistency.value = true;
  getDeviceSpy = jest.spyOn(device, "getDevice")
    .mockImplementation(() => ({ on: mockOn }) as never);
  getStateSpy = jest.spyOn(store, "getState")
    .mockImplementation(() => ({ bot: { consistent: mockConsistency.value } }) as never);
});

afterEach(() => {
  getDeviceSpy.mockRestore();
  getStateSpy.mockRestore();
});

describe("startTracking", () => {
  it("dispatches actions / event handlers: stop after timeout", () => {
    jest.useFakeTimers();
    const b4 = outstandingRequests.all.size;
    startTracking(unprocessedUuid);
    expect(device.getDevice().on).toHaveBeenCalledWith(niceUuid, expect.any(Function));
    expect(outstandingRequests.all.size).toBe(b4 + 1);
    jest.advanceTimersByTime(MAX_WAIT + 10);
    expect(outstandingRequests.all.size).toBe(b4);
  });

  it("dispatches actions / event handlers: stop after bot.on", () => {
    const b4 = outstandingRequests.all.size;
    startTracking(unprocessedUuid);
    expect(device.getDevice().on).toHaveBeenCalledWith(niceUuid, expect.any(Function));
    expect(outstandingRequests.all.size).toBe(b4 + 1);
    mockOn.mock.calls[0][1]();
    expect(outstandingRequests.all.size).toBe(b4);
  });
});

describe("stopTracking", () => {
  it("dispatches actions / event handlers", () => {
    startTracking(unprocessedUuid);
    const b4 = outstandingRequests.all.size;
    mockConsistency.value = false;
    stopTracking(unprocessedUuid);
    expect(outstandingRequests.all.size).toBe(b4 - 1);
  });
});
