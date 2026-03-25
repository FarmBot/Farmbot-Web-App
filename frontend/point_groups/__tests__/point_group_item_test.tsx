import React from "react";
import {
  PointGroupItem, PointGroupItemProps, genericPointIcon,
  genericWeedIcon,
  svgToUrl,
} from "../point_group_item";
import { render } from "@testing-library/react";
import {
  fakePlant, fakePointGroup, fakePoint, fakeToolSlot, fakeWeed, fakeTool,
  fakePlantTemplate,
} from "../../__test_support__/fake_state/resources";
import * as mapActions from "../../farm_designer/map/actions";
import { cloneDeep } from "lodash";
import { error } from "../../toast/toast";
import * as groupActions from "../actions";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import { fakeToolTransformProps } from "../../__test_support__/fake_tool_info";
import { FilePath, Path } from "../../internal_urls";

describe("<PointGroupItem/>", () => {
  let overwriteGroupSpy: jest.SpyInstance;
  let setHoveredPlantSpy: jest.SpyInstance;

  beforeEach(() => {
    overwriteGroupSpy = jest.spyOn(groupActions, "overwriteGroup")
      .mockImplementation(jest.fn());
    setHoveredPlantSpy = jest.spyOn(mapActions, "setHoveredPlant")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    overwriteGroupSpy.mockRestore();
    setHoveredPlantSpy.mockRestore();
  });

  const fakeProps = (): PointGroupItemProps => ({
    dispatch: mockDispatch(),
    point: fakePlant(),
    group: fakePointGroup(),
    hovered: true,
    tools: [],
    toolTransformProps: fakeToolTransformProps(),
  });

  it("renders", () => {
    const p = fakeProps();
    const i = new PointGroupItem(p);
    const element = i.render() as React.ReactElement<{
      onMouseEnter: () => void;
      onMouseLeave: () => void;
      onClick: () => void;
    }>;
    expect(element.props.onMouseEnter).toEqual(i.enter);
    expect(element.props.onMouseLeave).toEqual(i.leave);
    expect(element.props.onClick).toEqual(i.click);
  });

  it("displays default plant icon", () => {
    const p = fakeProps();
    p.point = fakePlant();
    const { container } = render(<PointGroupItem {...p} />);
    expect((container.querySelector("img") as HTMLImageElement).src)
      .toContain("/crops/icons/strawberry.avif");
  });

  it("displays default plant template icon", () => {
    const p = fakeProps();
    p.point = fakePlantTemplate();
    const { container } = render(<PointGroupItem {...p} />);
    expect((container.querySelector("img") as HTMLImageElement).src)
      .toContain("/crops/icons/mint.avif");
  });

  it("displays point icon", () => {
    const p = fakeProps();
    p.point = fakePoint();
    const { container } = render(<PointGroupItem {...p} />);
    expect((container.querySelector("img") as HTMLImageElement).src).toEqual(
      svgToUrl(genericPointIcon(undefined)));
  });

  it("displays weed icon", () => {
    const p = fakeProps();
    p.point = fakeWeed();
    p.point.body.meta.color = undefined;
    const { container } = render(<PointGroupItem {...p} />);
    const images = container.querySelectorAll("img");
    expect((images[0]).src).toContain(FilePath.DEFAULT_WEED_ICON);
    expect((images[1]).src).toEqual(
      svgToUrl(genericWeedIcon(undefined)));
    expect(container.querySelectorAll(".slot-icon").length).toEqual(0);
  });

  it("displays tool slot icon", () => {
    const p = fakeProps();
    p.point = fakeToolSlot();
    const { container } = render(<PointGroupItem {...p} />);
    expect((container.querySelector("img") as HTMLImageElement).src).toEqual(
      svgToUrl("<svg xmlns='http://www.w3.org/2000/svg'></svg>"));
    expect(container.querySelectorAll(".slot-icon").length).toEqual(1);
  });

  it("displays named tool slot icon", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    tool.body.name = "fake tool";
    p.tools = [tool];
    const toolSlot = fakeToolSlot();
    toolSlot.body.tool_id = 1;
    p.point = toolSlot;
    const { container } = render(<PointGroupItem {...p} />);
    expect((container.querySelector("img") as HTMLImageElement).src).toEqual(
      svgToUrl("<svg xmlns='http://www.w3.org/2000/svg'></svg>"));
    expect(container.querySelectorAll(".slot-icon").length).toEqual(1);
  });

  it("handles mouse enter", () => {
    const i = new PointGroupItem(fakeProps());
    i.enter();
    expect(i.props.dispatch).toHaveBeenCalledTimes(1);
    expect(mapActions.setHoveredPlant).toHaveBeenCalledWith(i.props.point.uuid);
  });

  it("handles mouse enter: no action", () => {
    const p = fakeProps();
    p.dispatch = undefined;
    const i = new PointGroupItem(p);
    i.enter();
    expect(mapActions.setHoveredPlant).not.toHaveBeenCalled();
  });

  it("handles mouse exit", () => {
    const i = new PointGroupItem(fakeProps());
    i.leave();
    expect(i.props.dispatch).toHaveBeenCalledTimes(1);
    expect(mapActions.setHoveredPlant).toHaveBeenCalledWith(undefined);
  });

  it("handles mouse exit: no action", () => {
    const p = fakeProps();
    p.dispatch = undefined;
    const i = new PointGroupItem(p);
    i.leave();
    expect(mapActions.setHoveredPlant).not.toHaveBeenCalled();
  });

  it("handles clicks", () => {
    const p = fakeProps();
    p.point.body.id = 1;
    p.group && (p.group.body.point_ids = [1]);
    const i = new PointGroupItem(p);
    i.click();
    expect(i.props.dispatch).toHaveBeenCalledTimes(2);
    const expectedGroupBody = cloneDeep(p.group?.body || { point_ids: [] });
    expectedGroupBody.point_ids = [];
    expect(groupActions.overwriteGroup).toHaveBeenCalledWith(p.group, expectedGroupBody);
    expect(mapActions.setHoveredPlant).toHaveBeenCalledWith(undefined);
  });

  it("handles clicks with no id", () => {
    const p = fakeProps();
    p.point.body.id = 0;
    p.group && (p.group.body.point_ids = [0]);
    const i = new PointGroupItem(p);
    i.click();
    expect(i.props.dispatch).toHaveBeenCalledTimes(2);
    const expectedGroupBody = cloneDeep(p.group?.body || { point_ids: [] });
    expectedGroupBody.point_ids = [];
    expect(groupActions.overwriteGroup).toHaveBeenCalledWith(p.group, expectedGroupBody);
    expect(mapActions.setHoveredPlant).toHaveBeenCalledWith(undefined);
  });

  it("errors on click", () => {
    const p = fakeProps();
    p.point.body.id = 1;
    p.group && (p.group.body.point_ids = []);
    const i = new PointGroupItem(p);
    i.click();
    expect(i.props.dispatch).not.toHaveBeenCalled();
    expect(groupActions.overwriteGroup).not.toHaveBeenCalled();
    expect(mapActions.setHoveredPlant).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "Cannot remove points selected by filters.");
  });

  it("handles clicks: no action", () => {
    const p = fakeProps();
    p.point.body.id = 1;
    p.group = undefined;
    p.dispatch = undefined;
    const i = new PointGroupItem(p);
    i.click();
    expect(groupActions.overwriteGroup).not.toHaveBeenCalled();
    expect(mapActions.setHoveredPlant).not.toHaveBeenCalled();
  });

  it("handles clicks: navigates", () => {
    const p = fakeProps();
    p.point.body.id = 1;
    p.group = undefined;
    p.dispatch = undefined;
    p.navigate = true;
    const i = new PointGroupItem(p);
    i.navigate = jest.fn();
    i.click();
    expect(groupActions.overwriteGroup).not.toHaveBeenCalled();
    expect(mapActions.setHoveredPlant).not.toHaveBeenCalled();
    expect(i.navigate).toHaveBeenCalledWith(Path.plants(1));
  });
});
