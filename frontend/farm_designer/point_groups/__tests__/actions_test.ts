jest.mock("../../../api/crud", () => {
  return {
    init: jest.fn(() => ({ payload: { uuid: "???" } })),
    save: jest.fn()
  };
});

jest.mock("../../../history", () => {
  return {
    history: { push: jest.fn() }
  };
});

jest.mock("../../../resources/selectors", () => ({
  findPointGroup: jest.fn(() => ({ body: { id: 323232332 } })),
  selectAllRegimens: jest.fn()
}));

import { createGroup } from "../actions";
import { init, save } from "../../../api/crud";
import { history } from "../../../history";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { fakePoint, fakePlant, fakeToolSlot } from "../../../__test_support__/fake_state/resources";
import { DeepPartial } from "redux";
import { Everything } from "../../../interfaces";

describe("group action creators and thunks", () => {
  it("creates groups", async () => {
    const fakePoints = [fakePoint(), fakePlant(), fakeToolSlot()];
    const resources = buildResourceIndex(fakePoints);
    const points = fakePoints.map(x => x.uuid);
    const fakeS: DeepPartial<Everything> = { resources };
    const dispatch = jest.fn(() => Promise.resolve());

    const thunk = createGroup({ points, name: "Name123" });
    await thunk(dispatch, () => fakeS as Everything);
    expect(init).toHaveBeenCalledWith("PointGroup", {
      name: "Name123",
      point_ids: [1, 2],
      sort_type: "xy_ascending"
    });
    expect(save).toHaveBeenCalledWith("???");
    expect(history.push)
      .toHaveBeenCalledWith("/app/designer/groups/323232332");
  });
});
