import { isSortType, sortTypeChange, SORT_OPTIONS } from "../point_group_sort_selector";
import { DropDownItem } from "../../../ui";
import { DeepPartial } from "redux";
import { TaggedPlant } from "../../map/interfaces";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";

const tests: [string, boolean][] = [
  ["", false],
  ["nope", false],
  ["random", true],
  ["xy_ascending", true],
  ["xy_descending", true],
  ["yx_ascending", true],
  ["yx_descending", true]
];

describe("isSortType", () => {
  it("identifies malformed sort types", () => {
    tests.map(([sortType, valid]) => {
      expect(isSortType(sortType)).toBe(valid);
    });
  });
});

describe("sortTypeChange", () => {
  it("selectively triggers the callback", () => {
    tests.map(([value, valid]) => {
      const cb = jest.fn();
      const ddi: DropDownItem = { value, label: "TEST" };
      if (valid) {
        sortTypeChange(cb)(ddi);
        expect(cb).toHaveBeenCalledWith(value);
      } else {
        sortTypeChange(cb)(ddi);
        expect(cb).not.toHaveBeenCalled();
      }
    });
  });
});

describe("", () => {
  const phony = (name: string, x: number, y: number): DeepPartial<TaggedPlant> => {
    return { body: { name, x, y } };
  };
  const plants = [
    phony("A", 0, 0),
    phony("B", 1, 0),
    phony("C", 1, 1),
    phony("D", 0, 1)
  ];

  const sort = (sortType: PointGroupSortType): string[] => {
    const array = SORT_OPTIONS[sortType](plants as TaggedPlant[]);
    return array.map(x => x && x.body && (x.body.name || "NA"));
  };

  it("sorts randomly", () => {
    const results = sort("random");
    expect(results.length).toEqual(plants.length);
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
