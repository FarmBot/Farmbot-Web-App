jest.mock("../actions", () => ({ selectRegimen: jest.fn() }));

import {
  fakeRegimen,
} from "../../__test_support__/fake_state/resources";
const regimen = fakeRegimen();
regimen.body.name = "regimen";
const mockRegimens = [regimen];

import { setActiveRegimenByName } from "../set_active_regimen_by_name";
import { selectRegimen } from "../actions";
import * as selectors from "../../resources/selectors";
import { store } from "../../redux/store";
import { Path } from "../../internal_urls";

let selectAllRegimensSpy: jest.SpyInstance;
const originalDispatch = store.dispatch;
const originalGetState = store.getState;
const mockDispatch = jest.fn();
const mockGetState = () => ({ resources: { index: {} } });

beforeEach(() => {
  selectAllRegimensSpy = jest.spyOn(selectors, "selectAllRegimens")
    .mockImplementation(() => mockRegimens);
  (store as unknown as { dispatch: Function }).dispatch = mockDispatch;
  (store as unknown as { getState: Function }).getState = mockGetState;
});

afterEach(() => {
  selectAllRegimensSpy.mockRestore();
  (store as unknown as { dispatch: Function }).dispatch = originalDispatch;
  (store as unknown as { getState: Function }).getState = originalGetState;
});

afterAll(() => {
  jest.unmock("../actions");
});
describe("setActiveRegimenByName()", () => {
  it("returns early if there is nothing to compare", () => {
    location.pathname = Path.mock(Path.regimens());
    setActiveRegimenByName();
    expect(selectRegimen).not.toHaveBeenCalled();
  });

  it("sometimes can't find a regimen by name", () => {
    const regimen = mockRegimens[0];
    location.pathname = Path.mock(Path.regimens("not_" + regimen.body.name));
    setActiveRegimenByName();
    expect(selectAllRegimensSpy).toHaveBeenCalled();
    expect(selectRegimen).not.toHaveBeenCalled();
  });

  it("finds a regimen by name", () => {
    const regimen = mockRegimens[0];
    location.pathname = Path.mock(Path.regimens(regimen.body.name));
    setActiveRegimenByName();
    expect(selectRegimen).toHaveBeenCalledWith(regimen.uuid);
  });
});
