import { SpecialStatus } from "farmbot";
import { destroyNO } from "../../resources/actions";
import { destroyCatch } from "../crud";

describe("destroyCatch", () => {
  it("Calls appropriate handlers", () => {
    const dispatch = jest.fn();
    const uuid = "foo.12.34";
    const statusBeforeError = SpecialStatus.DIRTY;
    const err = {};
    const handler = destroyCatch({
      dispatch,
      uuid,
      statusBeforeError
    });
    handler(err);
    const expected = destroyNO({ err, uuid, statusBeforeError });
    expect(dispatch).toHaveBeenCalledWith(expected);
  });
});
