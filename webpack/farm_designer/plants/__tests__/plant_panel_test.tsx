import * as React from "react";
import { PlantPanel } from "../plant_panel";
import { shallow } from "enzyme";

describe("<PlantPanel/>", () => {
  const info = {
    x: 12,
    y: 34,
    id: undefined,
    name: "tomato",
    uuid: "444-555-666-777-888",
    daysOld: 1,
    plantedAt: "2017-06-19T08:02:22.466-05:00",
    slug: "tomato"
  };

  it("renders: editing", () => {
    const onDestroy = jest.fn();
    const el = shallow(<PlantPanel info={info} onDestroy={onDestroy} />);
    const txt = el.text().toLowerCase();
    expect(txt).toContain("1 days old");
    expect(txt).toContain("(10, 30)");
    el.find("button").first().simulate("click");
    expect(onDestroy.mock.calls.length).toEqual(1);
  });

  it("renders", () => {
    const el = shallow(<PlantPanel info={info} />);
    const txt = el.text().toLowerCase();
    expect(txt).toContain("1 days old");
    expect(txt).toContain("(12, 34)");
  });
});
