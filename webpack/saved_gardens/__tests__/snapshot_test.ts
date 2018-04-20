jest.mock("axios")

import { snapshotGarden } from "../snapshot";
import { API } from "../../api";
import Axios from "axios";

describe("snapshotGarden", () => {
  it("calls the API and lets auto-sync do the rest", () => {
    API.setBaseUrl("example.io");
    snapshotGarden();
    expect(Axios.post).toHaveBeenCalledWith(API.current.snapshotPath);
  });
});
