const mockGet = jest.fn(() => Promise.resolve({ data: [] }));
jest.mock("axios", () => ({ default: { get: mockGet } }));
import { refreshLogs } from "../refresh_logs";
import axios from "axios";
import { API } from "../../api";
import { Actions } from "../../constants";

describe("refreshLogs", () => {
  it("dispatches the appropriate action", async () => {
    const dispatch = jest.fn();
    API.setBaseUrl("localhost");
    await refreshLogs(dispatch);
    expect(axios.get).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      payload: { data: [], name: "Log" },
      type: Actions.RESOURCE_READY
    });
  });
});
