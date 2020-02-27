import { SORT_OPTIONS } from "../point_group_sort";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";
import { TaggedPoint } from "farmbot";
import { fakePlant } from "../../../__test_support__/fake_state/resources";

describe("sort()", () => {
  const phony = (name: string, x: number, y: number): TaggedPoint => {
    const plant = fakePlant();
    plant.body.name = name;
    plant.body.x = x;
    plant.body.y = y;
    return plant;
  };
  const fakePoints = [
    phony("A", 0, 0),
    phony("B", 1, 0),
    phony("C", 1, 1),
    phony("D", 0, 1)
  ];

  const sort = (sortType: PointGroupSortType): string[] => {
    const array = SORT_OPTIONS[sortType](fakePoints);
    return array.map(x => x?.body?.name || "NA");
  };

  it("sorts randomly", () => {
    const results = sort("random");
    expect(results.length).toEqual(fakePoints.length);
  });

  it("sorts by xy_ascending", () => {
    const results = sort("xy_ascending");
    expect(results).toEqual(["A", "D", "B", "C"]);
  });

  it("sorts by xy_descending", () => {
    const results = sort("xy_descending");
    expect(results).toEqual(["C", "B", "D", "A"]);
  });

  it("sorts by yx_ascending", () => {
    const results = sort("yx_ascending");
    expect(results).toEqual(["A", "B", "D", "C"]);
  });

  it("sorts by yx_descending", () => {
    const results = sort("yx_descending");
    expect(results).toEqual(["C", "D", "B", "A"]);
  });
});
