import { createGroup, overwriteGroup, type CreateGroupProps } from "../actions";
import * as crud from "../../api/crud";
import * as selectors from "../../resources/selectors";
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
import { betterCompact } from "../../util";

let mockPointGroup = { body: { id: 323232332 } };
let initSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let overwriteSpy: jest.SpyInstance;
let findPointGroupSpy: jest.SpyInstance;
let selectAllRegimensSpy: jest.SpyInstance;
let selectAllPlantPointersSpy: jest.SpyInstance;
let findUuidSpy: jest.SpyInstance;

beforeEach(() => {
  initSpy = jest.spyOn(crud, "init")
    .mockImplementation((() =>
      ({ payload: { uuid: "???" } })) as unknown as typeof crud.init);
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  overwriteSpy = jest.spyOn(crud, "overwrite").mockImplementation(jest.fn());
  findPointGroupSpy = jest.spyOn(selectors, "findPointGroup")
    .mockImplementation((() =>
      mockPointGroup) as unknown as typeof selectors.findPointGroup);
  selectAllRegimensSpy = jest.spyOn(selectors, "selectAllRegimens")
    .mockImplementation(jest.fn());
  selectAllPlantPointersSpy = jest.spyOn(selectors, "selectAllPlantPointers")
    .mockImplementation(jest.fn(() => []));
  findUuidSpy = jest.spyOn(selectors, "findUuid")
    .mockImplementation(() => "PointGroup.0.0");
});

afterEach(() => {
  initSpy.mockRestore();
  saveSpy.mockRestore();
  overwriteSpy.mockRestore();
  findPointGroupSpy.mockRestore();
  selectAllRegimensSpy.mockRestore();
  selectAllPlantPointersSpy.mockRestore();
  findUuidSpy.mockRestore();
});

describe("createGroup()", () => {
  const fakeProps = (): CreateGroupProps => ({ navigate: jest.fn() });

  it("creates group", async () => {
    mockPointGroup = { body: { id: 323232332 } };
    const p = fakeProps();
    const fakePoints = [fakePoint(), fakePlant(), fakeToolSlot()];
    const resources = buildResourceIndex(fakePoints);
    p.pointUuids = fakePoints.map(x => x.uuid);
    p.groupName = "Name123";
    const expectedPointIds = betterCompact(fakePoints.map(x => x.body.id));
    const fakeS: DeepPartial<Everything> = { resources };
    const dispatch = jest.fn(() => Promise.resolve());

    const thunk = createGroup(p);
    await thunk(dispatch, () => fakeS as Everything);
    expect(crud.init).toHaveBeenCalledWith("PointGroup", expect.objectContaining({
      name: "Name123",
      point_ids: expectedPointIds,
      sort_type: "nn",
      criteria: DEFAULT_CRITERIA,
    }));
    expect(crud.save).toHaveBeenCalledWith("???");
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
    const expectedPointIds = betterCompact(fakePoints.map(x => x.body.id));
    const thunk = createGroup(p);
    await thunk(jest.fn(() => Promise.resolve()), () => state);
    expect(crud.init).toHaveBeenCalledWith("PointGroup", expect.objectContaining({
      name: "Untitled Group",
      point_ids: expectedPointIds,
      sort_type: "nn",
      criteria: DEFAULT_CRITERIA,
    }));
    expect(crud.save).toHaveBeenCalledWith("???");
    expect(p.navigate).toHaveBeenCalledWith(Path.groups());
  });
});

describe("overwriteGroup()", () => {
  it("overwrites and saves", () => {
    const group = fakePointGroup();
    const newGroupBody = cloneDeep(group.body);
    newGroupBody.point_ids = [1, 2, 3];
    overwriteGroup(group, newGroupBody)(jest.fn());
    expect(crud.overwrite).toHaveBeenCalledWith(group, newGroupBody);
    expect(crud.save).toHaveBeenCalledWith(group.uuid);
  });
});
