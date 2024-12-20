jest.mock("../actions", () => ({
  selectSequence: jest.fn(),
}));

import { fakeSequence } from "../../__test_support__/fake_state/resources";
const sequence = fakeSequence();
sequence.body.name = "sequence";
const mockSequences = [fakeSequence()];
jest.mock("../../resources/selectors", () => ({
  selectAllSequences: jest.fn(() => mockSequences),
  selectAllPlantPointers: jest.fn(() => []),
  findUuid: jest.fn(),
}));

jest.mock("../../redux/store", () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({ resources: { index: {} } }))
  }
}));

jest.mock("../test_button", () => ({
  setMenuOpen: jest.fn(),
}));

import { setActiveSequenceByName } from "../set_active_sequence_by_name";
import { selectSequence } from "../actions";
import { selectAllSequences } from "../../resources/selectors";
import { Path } from "../../internal_urls";

describe("setActiveSequenceByName()", () => {
  it("returns early if there is nothing to compare", () => {
    location.pathname = Path.mock(Path.designerSequences());
    setActiveSequenceByName();
    expect(selectSequence).not.toHaveBeenCalled();
  });

  it("sometimes can't find a sequence by name", () => {
    const sequence = mockSequences[0];
    location.pathname = Path.mock(Path.designerSequences(
      "not_" + sequence.body.name));
    setActiveSequenceByName();
    expect(selectAllSequences).toHaveBeenCalled();
    expect(selectSequence).not.toHaveBeenCalled();
  });

  it("finds a sequence by name", () => {
    const sequence = mockSequences[0];
    jest.clearAllTimers();
    location.pathname = Path.mock(Path.designerSequences(sequence.body.name));
    setActiveSequenceByName();
    expect(selectSequence).toHaveBeenCalledWith(sequence.uuid);
  });
});
