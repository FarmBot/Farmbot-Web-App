jest.mock("../../../api/crud", () => ({
  init: jest.fn(() => ({ payload: { uuid: "???" } })),
  save: jest.fn()
}));

jest.mock("../../../history", () => ({ history: { push: jest.fn() } }));

jest.mock("../../../resources/selectors", () => ({
  findPointGroup: jest.fn(() => ({ body: { id: 323232332 } })),
  selectAllRegimens: jest.fn()
}));

import { createGroup } from "../actions";
import { init, save } from "../../../api/crud";
import { history } from "../../../history";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakePoint, fakePlant, fakeToolSlot,
} from "../../../__test_support__/fake_state/resources";
import { DeepPartial } from "redux";
import { Everything } from "../../../interfaces";
import { DEFAULT_CRITERIA } from "../criteria/interfaces";

describe("group action creators and thunks", () => {
  it("creates groups", async () => {
    const fakePoints = [fakePoint(), fakePlant(), fakeToolSlot()];
    const resources = buildResourceIndex(fakePoints);
    const pointUuids = fakePoints.map(x => x.uuid);
    const fakeS: DeepPartial<Everything> = { resources };
    const dispatch = jest.fn(() => Promise.resolve());

    const thunk = createGroup({ pointUuids, groupName: "Name123" });
    await thunk(dispatch, () => fakeS as Everything);
    expect(init).toHaveBeenCalledWith("PointGroup", expect.objectContaining({
      name: "Name123",
      point_ids: [1, 2],
      sort_type: "xy_ascending",
      group_type: ["Plant"],
      criteria: DEFAULT_CRITERIA,
    }));
    expect(save).toHaveBeenCalledWith("???");
    expect(history.push)
      .toHaveBeenCalledWith("/app/designer/groups/323232332");
  });
});
