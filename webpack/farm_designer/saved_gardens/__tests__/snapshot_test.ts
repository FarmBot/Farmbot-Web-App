jest.mock("axios", () => {
  return { default: { post: jest.fn(() => Promise.resolve()) } };
});

import { snapshotGarden } from "../snapshot";
import { API } from "../../../api";
import axios from "axios";

describe("snapshotGarden", () => {
  it("calls the API and lets auto-sync do the rest", () => {
    API.setBaseUrl("example.io");
    snapshotGarden();
    expect(axios.post).toHaveBeenCalledWith(API.current.snapshotPath, {});
  });

  it("calls with garden name", () => {
    snapshotGarden("new saved garden");
    expect(axios.post).toHaveBeenCalledWith(
      API.current.snapshotPath, { name: "new saved garden" });
  });
});
