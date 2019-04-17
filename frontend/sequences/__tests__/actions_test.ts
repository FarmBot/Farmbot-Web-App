jest.mock("../../history", () => ({ push: jest.fn() }));

jest.mock("../../api/crud", () => ({
  init: jest.fn(),
  edit: jest.fn(),
  overwrite: jest.fn(),
}));

jest.mock("../set_active_sequence_by_name", () => ({
  setActiveSequenceByName: jest.fn()
}));

import {
  copySequence, editCurrentSequence, selectSequence, pushStep
} from "../actions";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { init, edit, overwrite } from "../../api/crud";
import { push } from "../../history";
import { Actions } from "../../constants";
import { setActiveSequenceByName } from "../set_active_sequence_by_name";
import { TakePhoto, Wait } from "farmbot";

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

  it("selects sequence", () => {
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

describe("pushStep()", () => {
  const step = (n: number): Wait => ({ kind: "wait", args: { milliseconds: n } });
  const NEW_STEP: TakePhoto = { kind: "take_photo", args: {} };

  it("adds step at 2", () => {
    const sequence = fakeSequence();
    sequence.body.body = [
      step(1),
      step(2),
      step(3),
    ];
    pushStep(NEW_STEP, jest.fn(), sequence, 2);
    expect(overwrite).toHaveBeenCalledWith(sequence, expect.objectContaining({
      body: [
        step(1),
        step(2),
        NEW_STEP,
        step(3),
      ]
    }));
  });

  it("adds step at end", () => {
    const sequence = fakeSequence();
    sequence.body.body = [
      step(1),
      step(2),
      step(3),
    ];
    pushStep(NEW_STEP, jest.fn(), sequence);
    expect(overwrite).toHaveBeenCalledWith(sequence, expect.objectContaining({
      body: [
        step(1),
        step(2),
        step(3),
        NEW_STEP,
      ]
    }));
  });
});
