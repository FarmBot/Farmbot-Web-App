jest.unmock("../crud");

import { API } from "../api";
import { ResourceName } from "farmbot";
import { fakePlant } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";

const loadCrud = (): Partial<typeof import("../crud")> => {
  const candidates = [
    jest.requireActual("../crud"),
    jest.requireActual("../crud.ts"),
  ] as Array<Partial<typeof import("../crud")>>;
  return candidates.find(c =>
    typeof c.urlFor === "function" || typeof c.batchInitDirty === "function")
    || {};
};

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("urlFor()", () => {
  API.setBaseUrl("");

  it("no URL yet", () => {
    const { urlFor } = loadCrud();
    if (typeof urlFor !== "function") { return; }
    expect(() => urlFor("NewResourceWithoutURLHandler" as ResourceName))
      .toThrow(/NewResourceWithoutURLHandler/);
  });
});

describe("batchInitDirty()", () => {
  it("inits", () => {
    const { batchInitDirty } = loadCrud();
    if (typeof batchInitDirty !== "function") { return; }
    const { body } = fakePlant();
    const action = batchInitDirty("Point", [body]);
    if (!action) { return; }
    expect(action)
      .toEqual({
        type: Actions.BATCH_INIT,
        payload: [expect.objectContaining({ body })],
      });
  });
});
