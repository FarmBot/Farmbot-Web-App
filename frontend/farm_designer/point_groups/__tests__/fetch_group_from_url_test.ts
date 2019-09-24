const mockId = 123;
jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => [mockId])
}));

import { fetchGroupFromUrl } from "../group_detail";
import { fakePointGroup } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";

describe("fetchGroupFromUrl", () => {
  it("fetches a group from URL", () => {
    const group = fakePointGroup();
    group.body.id = mockId;
    const result = fetchGroupFromUrl(buildResourceIndex([group]).index);
    expect(result).toEqual(group);
  });

  it("fetches a group from URL", () => {
    const group = fakePointGroup();
    group.body.id = 0; // intentionally wrong.
    const result = fetchGroupFromUrl(buildResourceIndex([group]).index);
    expect(result).toEqual(undefined);
  });
});
