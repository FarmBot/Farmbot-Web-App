jest.mock("../../history", () => ({ push: jest.fn() }));

jest.mock("../../api/crud", () => ({
  init: jest.fn(),
  edit: jest.fn()
}));

jest.mock("../set_active_sequence_by_name", () => ({
  setActiveSequenceByName: jest.fn()
}));

import {
  copySequence, editCurrentSequence, selectSequence
} from "../actions";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { init, edit } from "../../api/crud";
import { push } from "../../history";
import { Actions } from "../../constants";
import { setActiveSequenceByName } from "../set_active_sequence_by_name";

describe("copySequence()", () => {
  it("copies sequence", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "wait", args: { milliseconds: 100 } }];
    const { body } = sequence.body;
    copySequence(sequence)(jest.fn());
    expect(init).toHaveBeenCalledWith("Sequence",
      expect.objectContaining({ name: "fake copy 1", body }));
  });

  it("updates current path", () => {
    copySequence(fakeSequence())(jest.fn());
    expect(push).toHaveBeenCalledWith("/app/sequences/fake_copy_2");
  });

  it("selcts sequence", () => {
    copySequence(fakeSequence())(jest.fn());
    expect(setActiveSequenceByName).toHaveBeenCalled();
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
