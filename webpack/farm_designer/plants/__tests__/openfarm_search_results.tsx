import * as React from "react";
import { mount } from "enzyme";
import { OpenFarmResults, SearchResultProps } from "../openfarm_search_results";

describe("<OpenFarmResults/>", () => {
  it("renders OpenFarmSearchResults", () => {
    const props: SearchResultProps = {
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
      ]
    };
    const el = mount(<OpenFarmResults {...props} />);
    const text = el.text();
    expect(text).toContain(props.cropSearchResults[0].crop.name);
    expect(text).toContain(props.cropSearchResults[1].crop.name);
    expect(el.find("Link").length).toEqual(props.cropSearchResults.length);
    expect(el.find("Link").first().prop("to"))
      .toContain(props.cropSearchResults[0].crop.slug);
  });
});
