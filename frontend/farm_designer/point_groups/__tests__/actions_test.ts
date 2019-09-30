jest.mock("../../../api/crud", () => {
  return { initSave: jest.fn(() => () => Promise.resolve({})) };
});

jest.mock("../../../history", () => {
  return {
    history: { push: jest.fn() }
  };
});

import { createGroup } from "../actions";
import { initSave } from "../../../api/crud";
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
    const expected = ["PointGroup", {
      name: "Name123",
      point_ids: [0, 1].map(x => fakePoints[x].body.id)
    }];
    const xz = initSave;
    expect(xz).toHaveBeenCalledWith(...expected);
    expect(history.push).toHaveBeenCalledWith("/app/designer/groups");
  });
});
