import { sortByNameAndPin } from "../list_and_label_support";

describe("sortByNameAndPin()", () => {
  it("sorts", () => {
    expect(sortByNameAndPin(17, 10)).toEqual(-1); // Button 1 < GPIO 10
    expect(sortByNameAndPin(2, 10)).toEqual(-1); // GPIO 2 < GPIO 10
    expect(sortByNameAndPin(17, 23)).toEqual(-1); // Button 1 < Button 2
    expect(sortByNameAndPin(23, 17)).toEqual(1); // Button 2 > Button 1
    expect(sortByNameAndPin(1, 1)).toEqual(0); // GPIO 1 == GPIO 1
  });
});
