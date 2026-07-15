import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { clone } from "lodash";
import { INITIAL } from "../../../config";
import { Actions } from "../../../../constants";
import {
  getStargazingCamera, getTelescopeGroundPosition, getTelescopeRotation,
  Telescope,
  TelescopeProps,
} from "../telescope";
import { getUtilitiesPostWorldPosition } from
  "../utilities_post_position";
import { RenderOrder } from "../../../constants";

describe("<Telescope />", () => {
  const fakeProps = (): TelescopeProps => {
    const config = { ...clone(INITIAL), animate: false };
    return {
      config,
      sunBelowHorizon: true,
      stargazing: false,
      camera: getStargazingCamera(config),
      dispatch: jest.fn(),
    };
  };

  it("renders the body and tripod and opens stargazing", () => {
    const props = fakeProps();
    const { container } = render(<Telescope {...props} />);
    expect(container.querySelector("[name='telescope-body-narrow']"))
      .toBeTruthy();
    expect(container.querySelector("[name='telescope-body-middle']"))
      .toBeTruthy();
    expect(container.querySelector("[name='telescope-body-wide']"))
      .toBeTruthy();
    expect(container.querySelector("[name='telescope-eyepiece']")
      ?.getAttribute("args")).toEqual("22,22,35,24");
    expect(container.querySelectorAll("[name^='telescope-tripod-leg-']"))
      .toHaveLength(3);
    const meshes = container.querySelectorAll(
      "[name^='telescope-']:not([name='telescope-body'])"
      + ":not([name='telescope-body-tilt'])",
    );
    expect(meshes).toHaveLength(10);
    meshes.forEach(mesh =>
      expect(Number(mesh.getAttribute("renderOrder")))
        .toEqual(RenderOrder.plants + 0.5));
    const depthSortedMaterials = container.querySelectorAll("[alphatest]");
    expect(depthSortedMaterials).toHaveLength(10);
    depthSortedMaterials.forEach(material =>
      expect(Number(material.getAttribute("alphatest"))).toBeGreaterThan(0));
    const telescope = container.querySelector("[name='telescope']");
    const body = container.querySelector("[name='telescope-body']");
    const bodyTilt = container.querySelector("[name='telescope-body-tilt']");
    expect(bodyTilt?.parentElement).toBe(body);
    expect(Number(body?.getAttribute("rotation-z")))
      .toBeCloseTo(Math.PI);
    expect(Number(bodyTilt?.getAttribute("rotation-y")))
      .toBeCloseTo(-40 * Math.PI / 180);
    telescope && fireEvent.click(telescope);
    expect(props.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_STARGAZING_MODE,
      payload: true,
    });
  });

  it("only opens stargazing when the sun is below the horizon", () => {
    const props = fakeProps();
    props.sunBelowHorizon = false;
    const { container } = render(<Telescope {...props} />);
    const telescope = container.querySelector("[name='telescope']");
    telescope && fireEvent.click(telescope);
    expect(props.dispatch).not.toHaveBeenCalled();
  });

  it("uses 1.5x the utilities post clearance and aims upward", () => {
    const props = fakeProps();
    const post = getUtilitiesPostWorldPosition(props.config);
    const position = getTelescopeGroundPosition(props.config);
    const bedOuterX = props.config.bedLengthOuter / 2;
    expect(position[0] - bedOuterX)
      .toEqual(1.5 * (post[0] - bedOuterX));
    expect(position[1]).toEqual(0);
    expect(position[2]).toBeLessThan(post[2]);

    const camera = getStargazingCamera(props.config);
    expect(camera.target[0]).toBeLessThan(camera.position[0]);
    expect(camera.target[1]).toBeCloseTo(camera.position[1]);
    expect(camera.target[2]).toBeGreaterThan(camera.position[2]);
    const horizontalDistance = Math.hypot(
      camera.target[0] - camera.position[0],
      camera.target[1] - camera.position[1],
    );
    const deltaZ = camera.target[2] - camera.position[2];
    expect(Math.atan2(deltaZ, horizontalDistance) * 180 / Math.PI)
      .toBeCloseTo(40);
  });

  it("extends above the grounded tripod with the bed Z offset", () => {
    const props = fakeProps();
    const baseCamera = getStargazingCamera(props.config);
    const baseGround = getTelescopeGroundPosition(props.config);
    props.config.bedZOffset = 500;
    props.camera = getStargazingCamera(props.config);
    const { container } = render(<Telescope {...props} />);
    const telescope = container.querySelector("[name='telescope']");
    const tripodTop = container.querySelector(
      "[name='telescope-tripod-top']",
    );
    const body = container.querySelector("[name='telescope-body']");
    const camera = getStargazingCamera(props.config);
    const groundPosition = getTelescopeGroundPosition(props.config);

    expect(Number(telescope?.getAttribute("position-z")))
      .toEqual(groundPosition[2]);
    expect(tripodTop?.getAttribute("args")).toEqual("30,30,790,24");
    expect(tripodTop?.getAttribute("position")).toEqual("0,0,865");
    expect(body?.getAttribute("position")).toEqual("0,0,1260");
    expect(camera.position[2] - groundPosition[2])
      .toBeCloseTo(baseCamera.position[2] - baseGround[2] + 500);
    expect(camera.target[2] - groundPosition[2])
      .toBeCloseTo(baseCamera.target[2] - baseGround[2] + 500);
  });

  it("tracks animated bed offsets without a second ground spring", () => {
    const props = fakeProps();
    props.config.animate = true;
    const { container, rerender } = render(<Telescope {...props} />);
    const initialBody = container.querySelector("[name='telescope-body']");
    const initialBodyWorldZ = getTelescopeGroundPosition(props.config)[2]
      + Number(initialBody?.getAttribute("position")?.split(",")[2]);

    props.config = { ...props.config, bedZOffset: 500 };
    props.camera = getStargazingCamera(props.config);
    rerender(<Telescope {...props} />);
    const telescope = container.querySelector("[name='telescope']");
    const visibilityOffset = container.querySelector(
      "[name='visibility-offset']",
    );
    const body = container.querySelector("[name='telescope-body']");
    const groundPosition = getTelescopeGroundPosition(props.config);
    const bodyWorldZ = groundPosition[2]
      + Number(body?.getAttribute("position")?.split(",")[2]);

    expect(Number(telescope?.getAttribute("position-z")))
      .toEqual(groundPosition[2]);
    expect(visibilityOffset?.parentElement).toBe(telescope);
    expect(bodyWorldZ).toEqual(initialBodyWorldZ);
  });

  it("aims the body along the stargazing camera orbit", () => {
    const props = fakeProps();
    props.camera = {
      position: [0, 0, 0],
      target: [0, 1, 1],
    };
    const { container } = render(<Telescope {...props} />);
    const body = container.querySelector("[name='telescope-body']");
    const bodyTilt = container.querySelector("[name='telescope-body-tilt']");
    expect(bodyTilt?.parentElement).toBe(body);
    expect(Number(body?.getAttribute("rotation-z")))
      .toBeCloseTo(Math.PI / 2);
    expect(Number(bodyTilt?.getAttribute("rotation-y")))
      .toBeCloseTo(-Math.PI / 4);
    expect(getTelescopeRotation({
      position: [1, 1, 1],
      target: [1, 1, 1],
    })).toEqual({
      heading: Math.PI,
      tilt: -40 * Math.PI / 180,
    });
  });
});
