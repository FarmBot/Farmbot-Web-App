import { batchInitDirty, urlFor } from "../crud";
import { API } from "../api";
import { ResourceName } from "farmbot";
import { fakePlant } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";

describe("urlFor()", () => {
  API.setBaseUrl("");

  it("no URL yet", () => {
    expect(() => urlFor("NewResourceWithoutURLHandler" as ResourceName))
      .toThrow(/NewResourceWithoutURLHandler/);
  });
});

describe("batchInitDirty()", () => {
  it("inits", () => {
    const { body } = fakePlant();
    expect(batchInitDirty("Point", [body]))
      .toEqual({
        type: Actions.BATCH_INIT,
        payload: [expect.objectContaining({ body })],
      });
  });
});
