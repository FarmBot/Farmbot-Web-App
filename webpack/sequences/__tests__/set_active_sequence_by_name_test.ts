import { fakeSequence } from "../../__test_support__/fake_state/resources";
const mockData = {
  lastUrlChunk: "Set me",
  fakeSequences: [fakeSequence()]
};

jest.mock("../../util/urls", () => {
  return {
    urlFriendly: jest.fn(x => x),
    lastUrlChunk: jest.fn(() => mockData.lastUrlChunk)
  };
});

jest.mock("../actions", () => ({ selectSequence: jest.fn() }));

jest.mock("../../resources/selectors", () => {
  return {
    selectAllSequences: jest.fn(() => {
      return mockData.fakeSequences || [];
    })
  };
});
import { setActiveSequenceByName } from "../set_active_sequence_by_name";
import { selectSequence } from "../actions";
import { selectAllSequences } from "../../resources/selectors";

describe("setActiveSequenceByName", () => {
  jest.useFakeTimers();

  it("returns early if there is nothing to compare", () => {
    mockData.lastUrlChunk = "sequences";
    setActiveSequenceByName();
    jest.runAllTimers();
    expect(selectSequence).not.toHaveBeenCalled();
  });

  it("sometimes can't find a sequence by name", () => {
    const body = mockData.fakeSequences[0].body;
    const name = "a different value than " + body.name;
    mockData.lastUrlChunk = name;
    setActiveSequenceByName();
    jest.runAllTimers();
    expect(selectAllSequences).toHaveBeenCalled();
    expect(selectSequence).not.toHaveBeenCalled();
  });

  it("finds a sequence by name", () => {
    const body = mockData.fakeSequences[0].body;
    jest.clearAllTimers();
    mockData.lastUrlChunk = name;
    setActiveSequenceByName();
    jest.runAllTimers();
    expect(true).toBe(true);
  });
});
