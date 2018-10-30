const mockGet = jest.fn(() => {
  return Promise.resolve({ data: [mockLog.body] });
});
jest.mock("axios", () => ({ default: { get: mockGet } }));
import { refreshLogs } from "../refresh_logs";
import axios from "axios";
import { API } from "../../api";
import { resourceReady } from "../../sync/actions";
import { fakeLog } from "../../__test_support__/fake_state/resources";

const mockLog = fakeLog();

describe("refreshLogs", () => {
  it("dispatches the appropriate action", async () => {
    const dispatch = jest.fn();
    API.setBaseUrl("localhost");
    await refreshLogs(dispatch);
    expect(axios.get).toHaveBeenCalled();
    const action = resourceReady("Log", mockLog);
    expect(dispatch).toHaveBeenCalledWith(action);
  });
});
