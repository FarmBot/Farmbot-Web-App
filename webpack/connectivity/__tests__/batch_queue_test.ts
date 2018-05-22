jest.mock("../connect_device", () => {
  return {
    bothUp: jest.fn(),
    batchInitResources: jest.fn(() => ({ type: "NOOP", payload: undefined }))
  };
});

import { BatchQueue } from "../batch_queue";
import { fakeLog } from "../../__test_support__/fake_state/resources";
import { bothUp, batchInitResources } from "../connect_device";

describe("BatchQueue", () => {
  it("calls bothUp() to track network connectivity", () => {
    const q = new BatchQueue(1);
    const log = fakeLog();
    q.push(log);
    q.work();
    expect(bothUp).toHaveBeenCalled();
    expect(batchInitResources).toHaveBeenCalledWith([log]);
  });
});
