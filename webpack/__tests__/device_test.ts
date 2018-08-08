// tslint:disable-next-line:class-name
class mockFarmbot { connect = () => Promise.resolve(this); }

jest.mock("farmbot", () => {
  return { Farmbot: mockFarmbot };
});

import { fetchNewDevice } from "../device";
import { auth } from "../__test_support__/fake_state/token";

describe("fetchNewDevice", () => {
  it("returns an instance of FarmBot", async () => {
    const bot = await fetchNewDevice(auth);
    expect(bot).toBeInstanceOf(mockFarmbot);
    // We use this for debugging in local dev env
    // tslint:disable-next-line:no-any
    expect((global as any)["current_bot"]).toBeDefined();
  });
});
