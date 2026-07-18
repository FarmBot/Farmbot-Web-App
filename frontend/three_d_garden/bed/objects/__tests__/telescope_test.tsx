import React from "react";
import {
  act, fireEvent, render, screen, waitFor,
} from "@testing-library/react";
import * as reactSpring from "@react-spring/three";
import { clone } from "lodash";
import { INITIAL } from "../../../config";
import { Actions } from "../../../../constants";
import {
  generateTelescopeStars, getStargazingCamera, getTelescopeGroundPosition,
  getTelescopeState, rotateTelescopeSphere, Telescope, telescopePopupZ,
  telescopeSpringTargets, telescopeStarShaderModification, TelescopeProps,
} from "../telescope";
import { getUtilitiesPostWorldPosition } from
  "../utilities_post_position";
import { RenderOrder } from "../../../constants";
import { Group as ThreeGroup } from "three";

describe("<Telescope />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.style.cursor = "default";
  });

  const fakeProps = (): TelescopeProps => {
    const config = { ...clone(INITIAL), animate: false };
    return {
      config,
      sunIsSet: true,
      stargazing: false,
      dispatch: jest.fn(),
      timeTravelDispatch: jest.fn(),
    };
  };

  const clickSphere = (container: HTMLElement) => {
    const sphere = container.querySelector("[name='telescope-sphere']");
    sphere && fireEvent.click(sphere);
  };

  const showTelescope = (container: HTMLElement) => clickSphere(container);

  it("enables and disables the telescope from the sphere", () => {
    const props = fakeProps();
    const { container, unmount } = render(<Telescope {...props} />);
    const sphere = container.querySelector("[name='telescope-sphere']");
    const offset = container.querySelector("[name='visibility-offset']");
    const sphereZ = Number(
      sphere?.getAttribute("position")?.split(",")[2],
    );

    expect(sphere).toBeTruthy();
    expect(offset?.getAttribute("position-z")).toEqual(String(-sphereZ));
    expect(sphere?.querySelector("[color='#000000']")
      ?.getAttribute("color")).toEqual("#000000");
    expect(container.querySelector("[name='celestial-sphere-stars']"))
      .toBeTruthy();
    expect(container.querySelector(
      "[name='celestial-sphere-stars'] [color='white']",
    )).toBeTruthy();
    expect(container.querySelector("[name='telescope-model']")).toBeNull();
    expect(container.textContent).not.toContain("Hide");

    sphere && fireEvent.pointerEnter(sphere);
    expect(document.body.style.cursor).toEqual("pointer");
    sphere && fireEvent.pointerLeave(sphere);
    expect(document.body.style.cursor).toEqual("default");
    clickSphere(container);
    expect(screen.getByText("Stargaze")).toBeTruthy();
    expect(container.querySelector(".telescope-popup")).toHaveClass("half-gap");
    expect(screen.getByText(
      "Click the telescope to see how many crop constellations you can find!",
    )).toBeTruthy();
    expect(screen.queryByText("TIME TRAVEL")).toBeNull();
    expect(screen.queryByText("SHOW TELESCOPE")).toBeNull();
    expect(container.querySelector(".telescope-popup .fb-toggle-button"))
      .toBeNull();
    expect(container.querySelector("[name='telescope-model']")).toBeTruthy();
    clickSphere(container);
    expect(container.querySelector(".telescope-popup")).toBeNull();
    expect(container.querySelector("[name='telescope-model']")).toBeNull();
    clickSphere(container);
    expect(container.querySelector(".telescope-popup")).toBeTruthy();

    const popup = container.querySelector(".telescope-popup");
    popup && fireEvent.pointerDown(popup);
    popup && fireEvent.contextMenu(popup);
    popup && fireEvent.wheel(popup);
    popup && fireEvent.click(popup);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(container.querySelector(".telescope-popup")).toBeNull();
    expect(container.querySelector("[name='telescope-model']")).toBeTruthy();
    clickSphere(container);
    expect(container.querySelector(".telescope-popup")).toBeNull();
    expect(container.querySelector("[name='telescope-model']")).toBeNull();

    clickSphere(container);
    const close = container.querySelector("[title='close']");
    close && fireEvent.click(close);
    expect(container.querySelector(".telescope-popup")).toBeNull();
    expect(container.querySelector("[name='telescope-model']")).toBeTruthy();

    clickSphere(container);
    expect(container.querySelector("[name='telescope-model']")).toBeNull();

    document.body.style.cursor = "pointer";
    unmount();
    expect(document.body.style.cursor).toEqual("pointer");
  });

  it("springs enabled and opens stargazing from the telescope", () => {
    const props = fakeProps();
    const { container } = render(<Telescope {...props} />);
    showTelescope(container);

    expect(container.querySelector("[name='telescope-body-narrow']"))
      .toBeTruthy();
    expect(container.querySelector("[name='telescope-body-middle']"))
      .toBeTruthy();
    expect(container.querySelector("[name='telescope-body-wide']"))
      .toBeTruthy();
    expect(container.querySelector("[name='telescope-eyepiece']")
      ?.getAttribute("args")).toEqual("22,22,35,24");
    expect(container.querySelector("[name='telescope-eyepiece']")
      ?.getAttribute("position")).toEqual("-415,0,0");
    expect(container.querySelectorAll("[name^='telescope-tripod-leg-']"))
      .toHaveLength(3);
    const meshes = container.querySelectorAll(
      "[name^='telescope-']:not([name='telescope-body'])"
      + ":not([name='telescope-body-tilt'])"
      + ":not([name='telescope-model'])"
      + ":not([name='telescope-sphere'])"
      + ":not([name='telescope-sphere-control'])",
    );
    expect(meshes).toHaveLength(10);
    meshes.forEach(mesh =>
      expect(Number(mesh.getAttribute("renderOrder")))
        .toEqual(RenderOrder.plants + 0.5));
    expect(Number(container.querySelector("[name='telescope-sphere']")
      ?.getAttribute("renderOrder")))
      .toEqual(RenderOrder.plants + 0.5);
    const depthSortedMaterials = container.querySelectorAll("[alphatest]");
    expect(depthSortedMaterials).toHaveLength(10);
    depthSortedMaterials.forEach(material =>
      expect(Number(material.getAttribute("alphatest"))).toBeGreaterThan(0));
    const body = container.querySelector("[name='telescope-body']");
    const bodyTilt = container.querySelector("[name='telescope-body-tilt']");
    expect(bodyTilt?.parentElement).toBe(body);
    expect(Number(body?.getAttribute("rotation-z")))
      .toBeCloseTo(Math.PI);
    expect(Number(bodyTilt?.getAttribute("rotation-y")))
      .toBeCloseTo(-20 * Math.PI / 180);
    expect(container.querySelector("[name='visibility-offset']")
      ?.getAttribute("position-z")).toEqual("0");

    const telescopeModel = container.querySelector(
      "[name='telescope-model']",
    );
    telescopeModel && fireEvent.click(telescopeModel);
    expect(props.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_VIEW_MODE,
      payload: "stargazing",
    });
    expect(container.querySelector(".telescope-popup")).toBeNull();
  });

  it("opens main nav time travel instead of stargazing during daytime", () => {
    const props = fakeProps();
    props.sunIsSet = false;
    const { container } = render(<Telescope {...props} />);
    showTelescope(container);
    const close = container.querySelector("[title='close']");
    close && fireEvent.click(close);
    expect(container.querySelector(".telescope-popup")).toBeNull();

    const telescopeModel = container.querySelector(
      "[name='telescope-model']",
    );
    telescopeModel && fireEvent.click(telescopeModel);

    expect(props.dispatch).not.toHaveBeenCalled();
    expect(container.querySelector(".telescope-popup")).toBeNull();
    expect(props.timeTravelDispatch).toHaveBeenCalledWith({
      type: Actions.OPEN_POPUP,
      payload: "timeTravel",
    });
  });

  it("removes outgoing objects only after their spring completes", () => {
    let finishSpring: (() => void) | undefined;
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation(props => {
        const values = typeof props == "function" ? props() : props;
        finishSpring = values.onRest as (() => void) | undefined;
        return [{
          ...values,
          ...(typeof values.to == "object" ? values.to : {}),
        }, {
          start: jest.fn(),
          set: jest.fn(),
        }] as unknown as ReturnType<typeof reactSpring.useSpring>;
      });
    const props = fakeProps();
    try {
      const { container } = render(<Telescope {...props} />);
      showTelescope(container);
      act(() => finishSpring?.());
      expect(container.querySelector("[name='telescope-model']"))
        .toBeTruthy();

      clickSphere(container);
      const outgoingModel = container.querySelector(
        "[name='telescope-model']",
      );
      expect(outgoingModel).toBeTruthy();
      outgoingModel && fireEvent.click(outgoingModel);
      expect(props.dispatch).not.toHaveBeenCalled();
      act(() => finishSpring?.());
      expect(container.querySelector("[name='telescope-model']")).toBeNull();

      expect(container.querySelector("[name='telescope-sphere']"))
        .toBeTruthy();
    } finally {
      springSpy.mockRestore();
    }
  });

  it("fades without moving during celestial view transitions", async () => {
    const props = fakeProps();
    const { container, rerender } = render(<Telescope {...props} />);
    expect(container.querySelector("[name='telescope-sphere']"))
      .toBeTruthy();
    showTelescope(container);
    expect(container.querySelector("[name='telescope-model']"))
      .toBeTruthy();
    const visibilityOffset = () => container.querySelector(
      "[name='visibility-offset']",
    );
    expect(visibilityOffset()?.getAttribute("position-z")).toEqual("0");
    props.stargazing = true;
    rerender(<Telescope {...props} />);
    await waitFor(() =>
      expect(container.querySelector("[name='telescope-model']")).toBeNull());
    expect(visibilityOffset()?.getAttribute("position-z")).toEqual("0");
    expect(container.querySelector("[name='telescope-sphere']")).toBeNull();

    props.stargazing = false;
    rerender(<Telescope {...props} />);
    expect(visibilityOffset()?.getAttribute("position-z")).toEqual("0");
    expect(container.querySelector("[name='telescope-model']")).toBeTruthy();
    expect(container.querySelector("[name='telescope-sphere']"))
      .toBeTruthy();
  });

  it("defines position and visibility targets", () => {
    expect(getTelescopeState(false, false)).toEqual("disabled");
    expect(getTelescopeState(true, true)).toEqual("disabled");
    expect(getTelescopeState(false, true)).toEqual("enabled");
    expect(telescopeSpringTargets(false, false, 100)).toEqual({
      groupOffset: -100,
      sphereOpacity: 1,
      telescopeOpacity: 0,
    });
    expect(telescopeSpringTargets(true, false, 100)).toEqual({
      groupOffset: 0,
      sphereOpacity: 1,
      telescopeOpacity: 1,
    });
    expect(telescopeSpringTargets(true, true, 100)).toEqual({
      groupOffset: 0,
      sphereOpacity: 0,
      telescopeOpacity: 0,
    });
    expect(telescopeSpringTargets(false, true, 100)).toEqual({
      groupOffset: -100,
      sphereOpacity: 0,
      telescopeOpacity: 0,
    });
  });

  it("generates 150 variably sized stars on the sphere surface", () => {
    let randomValue = 0;
    const stars = generateTelescopeStars(() => {
      randomValue = (randomValue + 0.37) % 1;
      return randomValue;
    });
    expect(stars.positions).toHaveLength(450);
    expect(stars.sizes).toHaveLength(150);
    const firstRadius = Math.hypot(...stars.positions.slice(0, 3));
    stars.sizes.forEach((_size, index) => {
      const offset = index * 3;
      expect(Math.hypot(...stars.positions.slice(offset, offset + 3)))
        .toBeCloseTo(firstRadius);
    });
    expect(Math.min(...stars.sizes)).toBeGreaterThanOrEqual(0.5);
    expect(Math.max(...stars.sizes)).toBeLessThanOrEqual(3);
    expect(Math.min(...stars.sizes)).toBeLessThan(Math.max(...stars.sizes));
  });

  it("applies each telescope star's individual size", () => {
    const shader = {
      vertexShader: "#include <common>\ngl_PointSize = size;",
    } as Parameters<typeof telescopeStarShaderModification>[0];
    telescopeStarShaderModification(shader);
    expect(shader.vertexShader).toContain("attribute float starSize");
    expect(shader.vertexShader).toContain("size * starSize");
  });

  it("positions the popup nearby and rotates only while enabled", () => {
    expect(telescopePopupZ(1000)).toEqual(1130);
    const sphere = new ThreeGroup();
    rotateTelescopeSphere(sphere, false, 30);
    expect(sphere.rotation.z).toEqual(0);
    // eslint-disable-next-line no-null/no-null
    rotateTelescopeSphere(null, true, 30);
    rotateTelescopeSphere(sphere, true, 30);
    expect(sphere.rotation.z).toBeCloseTo(1.5 * Math.PI);
  });

  it("uses 1.5x the utilities post clearance and aims at the body", () => {
    const props = fakeProps();
    const post = getUtilitiesPostWorldPosition(props.config);
    const position = getTelescopeGroundPosition(props.config);
    const bedOuterX = props.config.bedLengthOuter / 2;
    expect(position[0] - bedOuterX)
      .toEqual(1.5 * (post[0] - bedOuterX));
    expect(position[1]).toEqual(0);
    expect(position[2]).toBeLessThan(post[2]);

    const camera = getStargazingCamera(props.config);
    expect(camera.target).toEqual([
      position[0],
      position[1],
      position[2] + 760 + props.config.bedZOffset,
    ]);
    expect(camera.target[0]).toBeLessThan(camera.position[0]);
    expect(camera.target[1]).toBeCloseTo(camera.position[1]);
    expect(camera.target[2]).toBeGreaterThan(camera.position[2]);
    expect(Math.hypot(
      camera.target[0] - camera.position[0],
      camera.target[1] - camera.position[1],
      camera.target[2] - camera.position[2],
    )).toBeCloseTo(460);
  });

  it("extends above the grounded tripod with the bed Z offset", () => {
    const props = fakeProps();
    const baseCamera = getStargazingCamera(props.config);
    const baseGround = getTelescopeGroundPosition(props.config);
    props.config.bedZOffset = 500;
    const { container } = render(<Telescope {...props} />);
    const sphere = container.querySelector("[name='telescope-sphere']");
    expect(sphere?.getAttribute("position")).toEqual("0,0,1560");
    showTelescope(container);
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
    showTelescope(container);
    const initialBody = container.querySelector("[name='telescope-body']");
    const initialBodyWorldZ = getTelescopeGroundPosition(props.config)[2]
      + Number(initialBody?.getAttribute("position")?.split(",")[2]);

    props.config = { ...props.config, bedZOffset: 500 };
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
});
