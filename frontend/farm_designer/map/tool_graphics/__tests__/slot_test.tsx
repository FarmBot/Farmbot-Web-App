import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import React from "react";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { BotOriginQuadrant } from "../../../interfaces";
import { SlotAxisProfileProps, ToolSlotGraphicProps } from "../interfaces";
import { SlotFrontProfile, SlotSideProfile, ToolbaySlot } from "../slot";

describe("<ToolbaySlot />", () => {
  const fakeProps = (): ToolSlotGraphicProps => ({
    id: undefined,
    x: 0,
    y: 0,
    pulloutDirection: ToolPulloutDirection.NONE,
    quadrant: BotOriginQuadrant.TWO,
    xySwap: false,
    occupied: false,
  });

  it("renders slot", () => {
    const wrapper = svgMount(<ToolbaySlot {...fakeProps()} />);
    expect(wrapper.html()).toContain("toolbay-slot");
  });
});

describe("<SlotFrontProfile />", () => {
  const fakeProps = (): SlotAxisProfileProps => ({
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    mirror: false,
  });

  it("renders front profile", () => {
    const wrapper = svgMount(<SlotFrontProfile {...fakeProps()} />);
    expect(wrapper.html()).toContain("slot-front-profile");
  });
});

describe("<SlotSideProfile />", () => {
  const fakeProps = (): SlotAxisProfileProps => ({
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    mirror: false,
  });

  it("renders side profile", () => {
    const wrapper = svgMount(<SlotSideProfile {...fakeProps()} />);
    expect(wrapper.html()).toContain("slot-side-profile");
  });
});
