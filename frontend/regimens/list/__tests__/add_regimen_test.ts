import { Actions } from "../../../constants";
import * as activeRegimen from "../../set_active_regimen_by_name";
import { Path } from "../../../internal_urls";
import * as crud from "../../../api/crud";
import { addRegimen } from "../add_regimen";

describe("addRegimen()", () => {
  let initSpy: jest.SpyInstance;
  let setActiveRegimenByNameSpy: jest.SpyInstance;

  beforeEach(() => {
    initSpy = jest.spyOn(crud, "init")
      .mockImplementation(jest.fn(
        () => ({ type: "INIT_RESOURCE", payload: { kind: "Regimen" } })));
    setActiveRegimenByNameSpy = jest.spyOn(activeRegimen, "setActiveRegimenByName")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    initSpy.mockRestore();
    setActiveRegimenByNameSpy.mockRestore();
  });

  it("dispatches a new regimen onclick", () => {
    const dispatch = jest.fn();
    const navigate = jest.fn();
    addRegimen(0, navigate)(dispatch);
    expect(crud.init).toHaveBeenCalledWith("Regimen", expect.objectContaining({
      name: "New Regimen 0"
    }));
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.INIT_RESOURCE,
      payload: expect.objectContaining({
        kind: "Regimen"
      })
    });
    expect(navigate).toHaveBeenCalledWith(Path.regimens("New_Regimen_0"));
    expect(activeRegimen.setActiveRegimenByName).toHaveBeenCalled();
  });
});
