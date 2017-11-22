const mockPush = jest.fn();
jest.mock("../../history", () => ({
  push: (url: string) => mockPush(url)
}));

const mockInit = jest.fn();
jest.mock("../../api/crud", () => ({
  init: mockInit
}));

import { copySequence } from "../actions";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";

describe("copySequence()", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("copies sequence", () => {
    const sequence = fakeSequence();
    const copy = copySequence(sequence);
    copy(jest.fn(), fakeState);
    const args = mockInit.mock.calls[0][0];
    expect(args.body.name).toEqual("fake copy 1");
  });

  it("updates current path", () => {
    const copy = copySequence(fakeSequence());
    copy(jest.fn(), fakeState);
    expect(mockPush).toHaveBeenCalledWith("/app/sequences/fake_copy_2");
  });
});
