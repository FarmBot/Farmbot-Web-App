jest.mock("../../actions", () => ({ editRegimen: jest.fn() }));

import { write } from "../regimen_name_input";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { editRegimen } from "../../actions";

describe("write()", () => {
  it("crashes without a regimen", () => {
    const input = { regimen: undefined, dispatch: jest.fn() };
    expect(() => write(input)).toThrowError();
  });

  it("calls dispatch", () => {
    const input = { regimen: fakeRegimen(), dispatch: jest.fn() };
    const callback = write(input);
    expect(callback).toBeInstanceOf(Function);
    const value = "FOO";
    // tslint:disable-next-line:no-any
    callback({ currentTarget: { value } } as any);
    expect(input.dispatch).toHaveBeenCalled();
    expect(editRegimen).toHaveBeenCalled();
  });
});
