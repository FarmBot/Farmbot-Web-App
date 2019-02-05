const mockGet = jest.fn(() => {
  return Promise.resolve({ data: [mockLog.body] });
});
jest.mock("axios", () => ({ get: mockGet }));
import { refreshLogs } from "../refresh_logs";
import axios from "axios";
import { API } from "../../api";
import { SyncResponse } from "../../sync/actions";
import { fakeLog } from "../../__test_support__/fake_state/resources";
import { TaggedLog } from "farmbot";
import { Actions } from "../../constants";

const mockLog = fakeLog();

describe("refreshLogs", () => {
  it("dispatches the appropriate action", async () => {
    const dispatch = jest.fn();
    API.setBaseUrl("localhost");
    await refreshLogs(dispatch);
    expect(axios.get).toHaveBeenCalled();
    const lastCall: SyncResponse<TaggedLog> = dispatch.mock.calls[0][0];
    expect(lastCall).toBeTruthy();
    expect(lastCall.type).toBe(Actions.RESOURCE_READY);
    expect(lastCall.payload.body[0].body).toEqual(mockLog.body);
  });
});
