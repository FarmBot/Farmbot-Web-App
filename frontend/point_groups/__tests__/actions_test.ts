jest.mock("../../api/crud", () => ({
  init: jest.fn(() => ({ payload: { uuid: "???" } })),
  overwrite: jest.fn(),
  save: jest.fn()
}));

let mockPointGroup = { body: { id: 323232332 } };
jest.mock("../../resources/selectors", () => ({
  findPointGroup: jest.fn(() => mockPointGroup),
  selectAllRegimens: jest.fn(),
  selectAllPlantPointers: jest.fn(() => []),
  findUuid: jest.fn(),
}));

import { createGroup, CreateGroupProps, overwriteGroup } from "../actions";
import { init, save, overwrite } from "../../api/crud";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import {
  fakePoint, fakePlant, fakeToolSlot, fakePointGroup,
} from "../../__test_support__/fake_state/resources";
import { DeepPartial } from "../../redux/interfaces";
import { Everything } from "../../interfaces";
import { DEFAULT_CRITERIA } from "../criteria/interfaces";
import { cloneDeep } from "lodash";
import { fakeState } from "../../__test_support__/fake_state";
import { Path } from "../../internal_urls";

describe("createGroup()", () => {
  const fakeProps = (): CreateGroupProps => ({
    navigate: jest.fn(),
  });

  it("creates group", async () => {
    const p = fakeProps();
    const fakePoints = [fakePoint(), fakePlant(), fakeToolSlot()];
    const resources = buildResourceIndex(fakePoints);
    p.pointUuids = fakePoints.map(x => x.uuid);
    p.groupName = "Name123";
    const fakeS: DeepPartial<Everything> = { resources };
    const dispatch = jest.fn(() => Promise.resolve());

    const thunk = createGroup(p);
    await thunk(dispatch, () => fakeS as Everything);
    expect(init).toHaveBeenCalledWith("PointGroup", expect.objectContaining({
      name: "Name123",
      point_ids: [1, 2],
      sort_type: "nn",
      criteria: DEFAULT_CRITERIA,
    }));
    expect(save).toHaveBeenCalledWith("???");
    expect(p.navigate)
      .toHaveBeenCalledWith(Path.groups(323232332));
  });

  it("creates group with default name", async () => {
    const p = fakeProps();
    mockPointGroup = { body: { id: 0 } };
    const state = fakeState();
    const point = fakePoint();
    point.body.id = 0;
    const fakePoints = [point, fakePlant(), fakeToolSlot()];
    state.resources = buildResourceIndex(fakePoints);
    p.pointUuids = fakePoints.map(x => x.uuid);
    p.pointUuids.push("missingFakeUuid");
    const thunk = createGroup(p);
    await thunk(jest.fn(() => Promise.resolve()), () => state);
    expect(init).toHaveBeenCalledWith("PointGroup", expect.objectContaining({
      name: "Untitled Group",
      point_ids: [4],
      sort_type: "nn",
      criteria: DEFAULT_CRITERIA,
    }));
    expect(save).toHaveBeenCalledWith("???");
    expect(p.navigate).toHaveBeenCalledWith(Path.groups());
  });
});

describe("overwriteGroup()", () => {
  it("overwrites and saves", () => {
    const group = fakePointGroup();
    const newGroupBody = cloneDeep(group.body);
    newGroupBody.point_ids = [1, 2, 3];
    overwriteGroup(group, newGroupBody)(jest.fn());
    expect(overwrite).toHaveBeenCalledWith(group, newGroupBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });
});
