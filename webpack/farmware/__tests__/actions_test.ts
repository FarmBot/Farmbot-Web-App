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
import { Actions } from "../../constants";

describe("getFirstPartyFarmwareList()", () => {
  it("sets list", async () => {
    const dispatch = jest.fn();
    await getFirstPartyFarmwareList()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.FETCH_FIRST_PARTY_FARMWARE_NAMES_OK,
      payload: ["farmware0", "farmware1"]
    });
  });
});
