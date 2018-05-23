jest.mock("../connect_device", () => {
  return {
    bothUp: jest.fn(),
    batchInitResources: jest.fn(() => ({ type: "NOOP", payload: undefined }))
  };
});

const mockThrottleStatus = { value: false };
jest.mock("../is_throttled", () => {
  return { deviceIsThrottled: jest.fn(() => mockThrottleStatus.value) };
});

import { BatchQueue } from "../batch_queue";
import { fakeLog } from "../../__test_support__/fake_state/resources";
import { bothUp, batchInitResources } from "../connect_device";

describe("BatchQueue", () => {
  it("calls bothUp() to track network connectivity", () => {
    jest.clearAllMocks();
    mockThrottleStatus.value = false;
    const q = new BatchQueue(1);
    const log = fakeLog();
    q.push(log);
    q.maybeWork();
    expect(bothUp).toHaveBeenCalled();
    expect(batchInitResources).toHaveBeenCalledWith([log]);
  });

  it("does nothing when throttled", () => {
    jest.clearAllMocks();
    mockThrottleStatus.value = true;
    const q = new BatchQueue(1);
    q.push(fakeLog());
    q.maybeWork();
    expect(bothUp).toHaveBeenCalled();
    expect(batchInitResources).not.toHaveBeenCalled();
  });
});
