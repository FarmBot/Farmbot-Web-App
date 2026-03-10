import { fakeSequence } from "../../__test_support__/fake_state/resources";
const sequence = fakeSequence();
sequence.body.name = "sequence";
const mockSequences = [fakeSequence()];
import * as sequenceActions from "../actions";
import * as selectors from "../../resources/selectors";
import { store } from "../../redux/store";
import * as testButton from "../test_button";
import { Path } from "../../internal_urls";
import { setActiveSequenceByName } from "../set_active_sequence_by_name";

describe("setActiveSequenceByName()", () => {
  let selectSequenceSpy: jest.SpyInstance;
  let selectAllSequencesSpy: jest.SpyInstance;
  let setMenuOpenSpy: jest.SpyInstance;
  let originalDispatch: typeof store.dispatch;
  let originalGetState: typeof store.getState;
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    originalDispatch = store.dispatch;
    originalGetState = store.getState;
    (store as unknown as { dispatch: jest.Mock }).dispatch = mockDispatch;
    (store as unknown as { getState: () => { resources: { index: {} } } }).getState =
      () => ({ resources: { index: {} } });
    selectSequenceSpy = jest.spyOn(sequenceActions, "selectSequence")
      .mockImplementation(() => ({ type: "SELECT_SEQUENCE", payload: undefined }));
    selectAllSequencesSpy = jest.spyOn(selectors, "selectAllSequences")
      .mockReturnValue(mockSequences);
    setMenuOpenSpy = jest.spyOn(testButton, "setMenuOpen")
      .mockReturnValue({ type: "SET_SEQUENCE_POPUP_STATE", payload: {} as never });
  });

  afterEach(() => {
    (store as unknown as { dispatch: typeof store.dispatch }).dispatch = originalDispatch;
    (store as unknown as { getState: typeof store.getState }).getState = originalGetState;
    selectSequenceSpy.mockRestore();
    selectAllSequencesSpy.mockRestore();
    setMenuOpenSpy.mockRestore();
  });

  it("returns early if there is nothing to compare", () => {
    location.pathname = Path.mock(Path.designerSequences());
    setActiveSequenceByName();
    expect(sequenceActions.selectSequence).not.toHaveBeenCalled();
  });

  it("sometimes can't find a sequence by name", () => {
    const sequence = mockSequences[0];
    location.pathname = Path.mock(Path.designerSequences(
      "not_" + sequence.body.name));
    setActiveSequenceByName();
    expect(selectors.selectAllSequences).toHaveBeenCalled();
    expect(sequenceActions.selectSequence).not.toHaveBeenCalled();
  });

  it("finds a sequence by name", () => {
    const sequence = mockSequences[0];
    location.pathname = Path.mock(Path.designerSequences(sequence.body.name));
    setActiveSequenceByName();
    expect(sequenceActions.selectSequence).toHaveBeenCalledWith(sequence.uuid);
  });
});
