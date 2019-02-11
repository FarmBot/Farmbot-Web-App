import { move } from "../move";

describe("move()", () => {
  it("shuffles array elems", () => {
    const fixture = [0, 1, 2];
    const case1 = move(fixture, 0, 2);
    expect(case1[0]).toEqual(1);
    expect(case1[1]).toEqual(2);
    expect(case1[2]).toEqual(0);

    const case2 = move(fixture, 1, 0);
    expect(case2[0]).toEqual(1);
    expect(case2[1]).toEqual(0);
    expect(case2[2]).toEqual(2);

    const case3 = move(fixture, 0, 0);
    expect(case3).toEqual(fixture);
  });
});
