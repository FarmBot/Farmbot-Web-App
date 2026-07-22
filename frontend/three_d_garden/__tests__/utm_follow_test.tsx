import React from "react";
import { act, render } from "@testing-library/react";
import * as threeFiber from "@react-three/fiber";
import { clone } from "lodash";
import { PerspectiveCamera, Vector3 } from "three";
import {
  getUtmFollowView,
  UTM_FOLLOW_CAMERA_X_OFFSET,
  UTM_FOLLOW_CAMERA_Z_OFFSET,
  UTM_FOLLOW_TARGET_Z_OFFSET,
  UtmFollowController,
} from "../utm_follow";
import { INITIAL, INITIAL_POSITION } from "../config";
import { getBotKinematics } from "../bot/kinematics";
import { createBotPositionSnapshotStore } from
  "../bot/position_spring";

describe("getUtmFollowView()", () => {
  it("positions the target and camera relative to the UTM", () => {
    const config = clone(INITIAL);
    const utm = getBotKinematics(
      config,
      INITIAL_POSITION,
    ).anchors.utm.worldPosition;
    const view = getUtmFollowView(config, INITIAL_POSITION);

    expect(view.target).toEqual([
      utm[0],
      utm[1],
      utm[2] + UTM_FOLLOW_TARGET_Z_OFFSET,
    ]);
    expect(view.position).toEqual([
      view.target[0] + UTM_FOLLOW_CAMERA_X_OFFSET,
      view.target[1],
      view.target[2] + UTM_FOLLOW_CAMERA_Z_OFFSET,
    ]);
  });
});

describe("<UtmFollowController />", () => {
  it("waits for the camera controls", () => {
    const useFrameSpy = jest.spyOn(threeFiber, "useFrame")
      .mockImplementation(() => {
        // eslint-disable-next-line no-null/no-null
        return null;
      });
    const camera = new PerspectiveCamera();
    render(<UtmFollowController
      enabled={true}
      botSpringActive={false}
      botPositionStore={createBotPositionSnapshotStore(INITIAL_POSITION)}
      config={clone(INITIAL)}
      position={INITIAL_POSITION}
      controlsCamera={camera}
      controls={undefined} />);
    useFrameSpy.mockRestore();
  });

  it("tracks the UTM while preserving zoom and stops when disabled", () => {
    let frame: Function = jest.fn();
    const useFrameSpy = jest.spyOn(threeFiber, "useFrame")
      .mockImplementation(callback => {
        frame = callback;
        // eslint-disable-next-line no-null/no-null
        return null;
      });
    const initialPosition = { ...INITIAL_POSITION };
    const store = createBotPositionSnapshotStore(initialPosition);
    const controlsCamera = new PerspectiveCamera();
    const controls = {
      target: new Vector3(),
      update: jest.fn(),
    };
    const props: React.ComponentProps<typeof UtmFollowController> = {
      enabled: true,
      botSpringActive: true,
      botPositionStore: store,
      config: clone(INITIAL),
      position: initialPosition,
      controlsCamera,
      controls,
    };
    const view = render(<UtmFollowController {...props} />);
    const initialTarget = controls.target.toArray();
    expect(controlsCamera.position.toArray()
      .map((value, index) => value - initialTarget[index]))
      .toEqual([
        UTM_FOLLOW_CAMERA_X_OFFSET,
        0,
        UTM_FOLLOW_CAMERA_Z_OFFSET,
      ]);
    expect(controlsCamera.up.toArray()).toEqual([0, 0, 1]);

    controlsCamera.position.add(new Vector3(100, 0, 30));
    act(() => {
      store.publish({ x: 600, y: 300, z: -50 });
      frame({ invalidate: jest.fn() }, 0.1);
    });
    const followedTarget = controls.target.toArray();
    expect(followedTarget).not.toEqual(initialTarget);
    expect(controlsCamera.position.toArray()
      .map((value, index) => value - followedTarget[index]))
      .toEqual([
        UTM_FOLLOW_CAMERA_X_OFFSET + 100,
        0,
        UTM_FOLLOW_CAMERA_Z_OFFSET + 30,
      ]);

    view.rerender(<UtmFollowController {...props} enabled={false} />);
    act(() => {
      store.publish({ x: 900, y: 500, z: -100 });
      frame({ invalidate: jest.fn() }, 0.1);
    });
    expect(controls.target.toArray()).toEqual(followedTarget);
    useFrameSpy.mockRestore();
  });
});
