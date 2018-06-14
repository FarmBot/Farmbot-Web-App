jest.mock("../../history", () => ({
  push: jest.fn()
}));

jest.mock("../../api/crud", () => ({
  init: jest.fn(),
  edit: jest.fn()
}));

import {
  copySequence, editCurrentSequence, selectSequence
} from "../actions";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { init, edit } from "../../api/crud";
import { push } from "../../history";
import { Actions } from "../../constants";

describe("copySequence()", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("copies sequence", () => {
    const sequence = fakeSequence();
    const copy = copySequence(sequence);
    copy(jest.fn());
    expect(init).toHaveBeenCalledWith(expect.objectContaining({
      body: expect.objectContaining({
        name: "fake copy 1"
      })
    }));
  });

  it("updates current path", () => {
    const copy = copySequence(fakeSequence());
    copy(jest.fn());
    expect(push).toHaveBeenCalledWith("/app/sequences/fake_copy_2");
  });
});

describe("editCurrentSequence()", () => {
  it("prepares update payload", () => {
    const fake = fakeSequence();
    editCurrentSequence(jest.fn, fake, { color: "red" });
    expect(edit).toHaveBeenCalledWith(
      expect.objectContaining({ uuid: fake.uuid }),
      { color: "red" });
  });
});

describe("selectSequence()", () => {
  it("prepares payload", () => {
    expect(selectSequence("Sequence.fake.uuid")).toEqual({
      type: Actions.SELECT_SEQUENCE,
      payload: "Sequence.fake.uuid"
    });
  });
});
