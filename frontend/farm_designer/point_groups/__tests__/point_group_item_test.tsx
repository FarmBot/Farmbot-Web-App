jest.mock("../../actions", () => ({ toggleHoveredPlant: jest.fn() }));
jest.mock("../../../api/crud", () => ({ overwrite: jest.fn() }));

import React from "react";
import { PointGroupItem } from "../point_group_item";
import { shallow } from "enzyme";
import { fakePlant, fakePointGroup } from "../../../__test_support__/fake_state/resources";
import { DeepPartial } from "redux";
import { cachedCrop } from "../../../open_farm/cached_crop";
import { toggleHoveredPlant } from "../../actions";
import { overwrite } from "../../../api/crud";

describe("<PointGroupItem/>", () => {
  const newProps = (): PointGroupItem["props"] => ({
    dispatch: jest.fn(),
    plant: fakePlant(),
    group: fakePointGroup(),
    hovered: true
  });

  it("renders", () => {
    const props = newProps();
    const el = shallow<HTMLSpanElement>(<PointGroupItem {...props} />);
    const i = el.instance() as PointGroupItem;
    expect(el.first().prop("onMouseEnter")).toEqual(i.enter);
    expect(el.first().prop("onMouseLeave")).toEqual(i.leave);
    expect(el.first().prop("onClick")).toEqual(i.click);
  });

  it("handles hovering", async () => {
    const i = new PointGroupItem(newProps());
    i.setState = jest.fn();
    type E = React.SyntheticEvent<HTMLImageElement, Event>;
    const partialE: DeepPartial<E> = {
      currentTarget: {
        getAttribute: jest.fn(),
        setAttribute: jest.fn(),
      }
    };
    const e = partialE as E;
    await i.maybeGetCachedIcon(e as E);
    const slug = i.props.plant.body.openfarm_slug;
    expect(cachedCrop).toHaveBeenCalledWith(slug);
    const icon = "data:image/svg+xml;utf8,icon";
    expect(i.setState).toHaveBeenCalledWith({ icon });
    expect(e.currentTarget.setAttribute).toHaveBeenCalledWith("src", icon);
  });

  it("handles mouse enter", () => {
    const i = new PointGroupItem(newProps());
    i.state.icon = "X";
    i.enter();
    expect(i.props.dispatch).toHaveBeenCalledTimes(1);
    expect(toggleHoveredPlant)
      .toHaveBeenCalledWith(i.props.plant.uuid, "X");
  });

  it("handles mouse exit", () => {
    const i = new PointGroupItem(newProps());
    i.state.icon = "X";
    i.leave();
    expect(i.props.dispatch).toHaveBeenCalledTimes(1);
    expect(toggleHoveredPlant).toHaveBeenCalledWith(undefined, "");
  });

  it("handles clicks", () => {
    const i = new PointGroupItem(newProps());
    i.click();
    expect(i.props.dispatch).toHaveBeenCalledTimes(1);
    expect(overwrite).toHaveBeenCalledWith({
      body: { name: "Fake", point_ids: [], sort_type: "xy_ascending" },
      kind: "PointGroup",
      specialStatus: "",
      uuid: expect.any(String),
    }, {
      name: "Fake",
      point_ids: [],
      sort_type: "xy_ascending",
    });
  });
});
