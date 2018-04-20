jest.mock("axios", () => {
  return { default: { patch: jest.fn(() => Promise.resolve()) } };
});

import { applyGarden } from "../apply_garden";
import { API } from "../../api";
import axios from "axios";

describe("applyGarden", () => {
  it("calls the API and lets auto-sync do the rest", () => {
    API.setBaseUrl("example.io");
    applyGarden(4);
    expect(axios.patch).toHaveBeenCalledWith(API.current.applyGardenPath(4));
  });
});
