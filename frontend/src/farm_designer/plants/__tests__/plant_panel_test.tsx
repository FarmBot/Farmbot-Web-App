import * as React from "react";
import { PlantPanel } from "../plant_panel";
import { shallow } from "enzyme";

describe("<PlantPanel/>", () => {
  it("renders", () => {
    let info = {
      x: 12,
      y: 34,
      id: undefined,
      name: "tomato",
      uuid: "444-555-666-777-888",
      daysOld: 1,
      plantedAt: "2017-06-19T08:02:22.466-05:00",
      slug: "tomato"
    };

    let onDestroy = jest.fn();

    let el = shallow(<PlantPanel info={info} onDestroy={onDestroy} />);
    let txt = el.text().toLowerCase();
    expect(txt).toContain("1 days old");
    expect(txt).toContain("(12, 34)");
    el.find("button").simulate("click");
    expect(onDestroy.mock.calls.length).toEqual(1);
  })
})
