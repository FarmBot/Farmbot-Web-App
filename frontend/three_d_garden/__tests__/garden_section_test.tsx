import React from "react";
import { clone } from "lodash";
import { INITIAL } from "../config";
import {
  GardenSectionLayer, getRenderedBotLocation,
} from "../garden_model";
import { createBotPositionSnapshotStore } from
  "../bot/position_spring";
import { fakeDesignerState } from
  "../../__test_support__/fake_designer_state";
import { SectionControls } from "../section_controls";
import { SectionGroundOverlays } from "../section_overlays";
import {
  actRenderer, createRenderer, unmountRenderer,
} from "../../__test_support__/test_renderer";

describe("<GardenSectionLayer />", () => {
  const config = () => {
    const result = clone(INITIAL);
    result.animate = true;
    result.bot = true;
    result.botSizeX = 1000;
    result.botSizeY = 600;
    result.bedLengthOuter = 1000;
    result.bedWidthOuter = 600;
    result.bedXOffset = 0;
    result.bedYOffset = 0;
    result.mirrorX = false;
    result.mirrorY = false;
    return result;
  };

  it("follows the bot's rendered spring position", () => {
    const c = config();
    const initialPosition = { x: 200, y: 100, z: 0 };
    const store = createBotPositionSnapshotStore(initialPosition);
    const designer = fakeDesignerState();
    designer.threeDSectionOpen = true;
    designer.threeDSectionAxis = "x";
    designer.threeDSectionFollowBot = true;
    const wrapper = createRenderer(<GardenSectionLayer
      bridgeRef={{ current: undefined }}
      botSpringActive={true}
      botPositionStore={store}
      camera={{ position: [1000, 1000, 1000], target: [0, 0, 0] }}
      config={c}
      configPosition={initialPosition}
      controlsCamera={undefined}
      designer={designer}
      dispatch={jest.fn()}
      gardenSize={{ x: 1000, y: 600 }}
      getZ={() => 0}
      modelRoot={undefined} />);

    const controls = () => wrapper.root.findByType(SectionControls);
    const overlays = () => wrapper.root.findByType(SectionGroundOverlays);
    expect(controls().props.center).toEqual(200);
    expect(controls().props.configPosition).toEqual(initialPosition);

    const springPosition = { x: 350, y: 125, z: -10 };
    actRenderer(() => store.publish(springPosition));

    expect(controls().props.center).toEqual(350);
    expect(controls().props.configPosition).toEqual(springPosition);
    expect(overlays().props.configPosition).toEqual(springPosition);
    unmountRenderer(wrapper);
  });

  it("converts mirrored spring positions back to garden coordinates", () => {
    const c = config();
    c.mirrorX = true;
    c.mirrorY = true;
    expect(getRenderedBotLocation(c, { x: 800, y: 500, z: -10 }))
      .toEqual({ x: 200, y: 100, z: -10 });
  });

  it("uses the reported position when the bot spring is not mounted", () => {
    const c = config();
    const reportedPosition = { x: 450, y: 200, z: 0 };
    const store = createBotPositionSnapshotStore({ x: 100, y: 100, z: 0 });
    const designer = fakeDesignerState();
    designer.threeDSectionOpen = true;
    designer.threeDSectionFollowBot = true;
    const wrapper = createRenderer(<GardenSectionLayer
      bridgeRef={{ current: undefined }}
      botSpringActive={false}
      botPositionStore={store}
      camera={{ position: [1000, 1000, 1000], target: [0, 0, 0] }}
      config={c}
      configPosition={reportedPosition}
      controlsCamera={undefined}
      designer={designer}
      dispatch={jest.fn()}
      gardenSize={{ x: 1000, y: 600 }}
      getZ={() => 0}
      modelRoot={undefined} />);

    const controls = wrapper.root.findByType(SectionControls);
    expect(controls.props.center).toEqual(450);
    expect(controls.props.configPosition).toEqual(reportedPosition);
    unmountRenderer(wrapper);
  });
});
