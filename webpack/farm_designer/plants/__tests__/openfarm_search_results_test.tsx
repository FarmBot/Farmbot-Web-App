import * as React from "react";
import { mount } from "enzyme";
import { OpenFarmResults, SearchResultProps } from "../openfarm_search_results";

describe("<OpenFarmResults/>", () => {
  const fakeProps = (): SearchResultProps => ({
    cropSearchResults: [
      {
        crop: {
          slug: "potato",
          name: "S. tuberosum"
        },
        image: "potato.jpg"
      },
      {
        crop: {
          slug: "tomato",
          name: "Solanum lycopersicum"
        },
        image: "tomato.jpg"
      },
    ],
    cropSearchInProgress: false,
  });

  it("renders OpenFarmSearchResults", () => {
    const p = fakeProps();
    const wrapper = mount(<OpenFarmResults {...p} />);
    const text = wrapper.text();
    expect(text).toContain(p.cropSearchResults[0].crop.name);
    expect(text).toContain(p.cropSearchResults[1].crop.name);
    expect(wrapper.find("Link").length).toEqual(p.cropSearchResults.length);
    expect(wrapper.find("Link").first().prop("to"))
      .toContain(p.cropSearchResults[0].crop.slug);
  });

  it("shows search in progress", () => {
    const p = fakeProps();
    p.cropSearchResults = [];
    p.cropSearchInProgress = true;
    const wrapper = mount(<OpenFarmResults {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("searching");
  });

  it("shows no results", () => {
    const p = fakeProps();
    p.cropSearchResults = [];
    p.cropSearchInProgress = false;
    const wrapper = mount(<OpenFarmResults {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("no search results");
  });
});
