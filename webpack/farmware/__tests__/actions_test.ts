jest.mock("axios", () => ({
  default: {
    get: jest.fn(() => {
      return Promise.resolve({
        data: [
          { manifest: "url", name: "farmware0" },
          { manifest: "url", name: "farmware1" }
        ]
      });
    })
  }
}));

import { getFirstPartyFarmwareList } from "../actions";

describe("getFirstPartyFarmwareList()", () => {
  it("sets list", async () => {
    const setList = jest.fn();
    await getFirstPartyFarmwareList(setList);
    expect(setList).toHaveBeenCalledWith(["farmware0", "farmware1"]);
  });
});
