jest.mock("../../../api/crud", () => ({
  overwrite: jest.fn(),
}));

import { remove, move, splice } from "../index";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { overwrite } from "../../../api/crud";
import { Wait } from "farmbot";

describe("remove()", () => {
  const fakeProps = () => ({
    index: 0,
    dispatch: jest.fn(),
    sequence: fakeSequence(),
    confirmStepDeletion: false,
  });

  it("deletes step without confirmation", () => {
    const p = fakeProps();
    remove(p);
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("deletes step with confirmation", () => {
    const p = fakeProps();
    p.confirmStepDeletion = true;
    window.confirm = jest.fn();
    remove(p);
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("delete this step?"));
    expect(p.dispatch).not.toHaveBeenCalled();
    window.confirm = jest.fn(() => true);
    remove(p);
    expect(p.dispatch).toHaveBeenCalled();
  });
});

describe("move()", () => {
  const sequence = fakeSequence();
  const step1: Wait = { kind: "wait", args: { milliseconds: 100 } };
  const step2: Wait = { kind: "wait", args: { milliseconds: 200 } };
  sequence.body.body = [step1, step2];
  const fakeProps = () => ({ step: step2, sequence, to: 0, from: 1, });

  it("moves step backward", () => {
    const p = fakeProps();
    p.from = 1;
    p.to = 0;
    move(p);
    expect(overwrite).toHaveBeenCalledWith(expect.any(Object),
      expect.objectContaining({ body: [step2, step1] }));
  });

  it("moves step forward", () => {
    const p = fakeProps();
    p.sequence.body.body = [step2, step1];
    p.from = 0;
    p.to = 2;
    move(p);
    expect(overwrite).toHaveBeenCalledWith(expect.any(Object),
      expect.objectContaining({ body: [step1, step2] }));
  });
});

describe("splice()", () => {
  const sequence = fakeSequence();
  const step: Wait = { kind: "wait", args: { milliseconds: 100 } };
  const fakeProps = () => ({ step, sequence, index: 1, });

  it("adds step", () => {
    const p = fakeProps();
    splice(p);
    expect(overwrite).toHaveBeenCalledWith(expect.any(Object),
      expect.objectContaining({ body: [step] }));
  });
});
