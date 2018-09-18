// tslint:disable-next-line:class-name
class mockFarmbot { connect = () => Promise.resolve(this); }

jest.mock("farmbot", () => {
  return { Farmbot: mockFarmbot };
});

import { fetchNewDevice } from "../device";
import { auth } from "../__test_support__/fake_state/token";
import { get } from "lodash";

describe("fetchNewDevice", () => {
  it("returns an instance of FarmBot", async () => {
    const bot = await fetchNewDevice(auth);
    expect(bot).toBeInstanceOf(mockFarmbot);
    // We use this for debugging in local dev env
    expect(get(global, "current_bot")).toBeDefined();
  });
});
