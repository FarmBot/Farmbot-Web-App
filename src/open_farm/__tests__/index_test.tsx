
jest.mock("axios", function () {
  return {
    default: {
      get: function () {
        return Promise.resolve({
          data: {
            id: 0,
            data: {
              attributes: {
                svg_icon: "<svg>Wow</svg>",
                slug: "lettuce"
              }
            }
          }
        });
      }
    }
  };
});

import { cachedIcon, DATA_URI, OpenFarmAPI } from "../index";
describe("cachedIcon()", () => {
  it("does an HTTP request if the icon can't be found locally", (done) => {
    cachedIcon("lettuce")
      .then(function (item) {
        expect(item).toContain(DATA_URI);
        expect(item).toContain(encodeURIComponent("<svg>Wow</svg>"));
        done();
      })
      .catch(() => {
        fail();
      });
  });

  it("has a base URL", () => {
    expect(OpenFarmAPI.OFBaseURL).toContain("openfarm.cc");
  });
});
