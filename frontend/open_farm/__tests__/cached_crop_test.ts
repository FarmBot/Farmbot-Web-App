jest.mock("axios", () => ({
  get: () => Promise.resolve({
    data: {
      id: 0,
      data: {
        attributes: {
          svg_icon: "<svg>Wow</svg>",
          slug: "lettuce"
        }
      }
    }
  })
}));

jest.unmock("../cached_crop");
import { cachedCrop } from "../cached_crop";

describe("cachedIcon()", () => {
  it("", () => {

  });

  it("does an HTTP request if the icon can't be found locally", (done) => {

    cachedCrop("lettuce")
      .then((item1) => {
        expect(item1.svg_icon).toContain("<svg>Wow</svg>");
        cachedCrop("lettuce").then((item2) => {
          /** Ensure that cache is actually being used: */
          expect(item2.slug).toBe(item1.slug);
          expect(item2.svg_icon).toBe(item1.svg_icon);
          expect(item2.spread).toBe(undefined);
          done();
        });
      })
      .catch((error) => {
        expect(error).toBeFalsy();
        done();
      });
  });
});
