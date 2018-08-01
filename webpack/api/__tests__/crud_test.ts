import { urlFor } from "../crud";
import { API } from "../api";
import { ResourceName } from "farmbot";

describe("urlFor()", () => {
  API.setBaseUrl("");

  it("no URL yet", () => {
    expect(() => urlFor("NewResourceWithoutURLHandler" as ResourceName))
      .toThrowError(/NewResourceWithoutURLHandler/);
  });
});
