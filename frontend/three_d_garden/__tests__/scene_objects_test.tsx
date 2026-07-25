import React, { ElementType } from "react";
import {
  act, fireEvent, render, renderHook,
} from "@testing-library/react";
import { Cone, Cylinder, Sphere } from "@react-three/drei";
import * as threeFiber from "@react-three/fiber";
import {
  nextSceneObjectName, sceneObjectCornersFromCenter, sceneObjectPoint,
  sceneObjectMoveUpdate, sceneObjectPosition, pointerRayPointAtZ,
  sceneObjectWithDragPreview, stopSceneObjectMarkerDragEvent,
  stopSceneObjectMarkerEvent, SceneObjects,
  staticSceneObjects, useSceneObjectPlacement, heightFromPointerRay,
  HOVER_ALL_SCENE_OBJECTS,
  sceneObjectTopResizeUpdate, topResizeMarkerHandlers,
  greenhouseWallRenderProps, placementAxisSize, SceneObjectPreview,
  sceneObjectAppearanceKey, applySceneObjectOpacity, unifiedSizeUpdate,
  rotatePointAboutZ, sceneObjectRotation,
  sceneObjectRotationControlPoints, sceneObjectRotationFromPointer,
  objectMarkerScale, sceneObjectPlacementRotation,
  sceneObjectRotationGuideVisible, snapSceneObjectRotation,
} from "../scene_objects";
import { clone } from "lodash";
import { INITIAL } from "../config";
import { BigDistance } from "../constants";
import {
  get3DPositionFunc, getGardenPositionFunc, zZero,
} from "../helpers";
import {
  type Material, MeshBasicMaterial as ThreeMeshBasicMaterial,
  Object3D, Ray, Vector3,
} from "three";
import {
  createRenderer, unmountRenderer,
} from "../../__test_support__/test_renderer";
import { Path } from "../../internal_urls";
import { fakeSceneObject } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import { SceneObjectFormValues } from "../../scene_objects/interfaces";
import { MeshPhongMaterial } from "../components";

type TestSceneObjectPlacementProps = Omit<
  Parameters<typeof useSceneObjectPlacement>[0],
  "navigate"
>;

const useTestSceneObjectPlacement = (
  props: TestSceneObjectPlacementProps,
) => useSceneObjectPlacement({ ...props, navigate: mockNavigate });

const positionArray = (position: unknown): [number, number, number] => {
  if (!Array.isArray(position)) { throw new Error("Expected position array."); }
  const [x, y, z] = position;
  if (typeof x != "number" || typeof y != "number" || typeof z != "number") {
    throw new Error("Expected numeric position.");
  }
  return [x, y, z];
};

const findSelectionMarker = (
  wrapper: ReturnType<typeof createRenderer>,
  name: string,
) => {
  const handle = wrapper.root.find(node =>
    node.type == "group" as ElementType &&
    node.props.name == `${name}-control` &&
    typeof node.props.onPointerDown == "function");
  const visual = wrapper.root.find(node =>
    node.props.name == name &&
    Array.isArray(node.props.args));
  const visualComponent = wrapper.root.find(node =>
    node.props.name == name &&
    typeof node.props.radius == "number");
  return new Proxy(handle, {
    get: (target, property) => property == "props"
      ? { ...target.props, ...visual.props, ...visualComponent.props }
      : Reflect.get(target, property),
  });
};

const findControlHandles = (
  wrapper: ReturnType<typeof createRenderer>,
  name: string,
) => wrapper.root.findAll(node =>
  node.type == "group" as ElementType &&
  node.props.name == name &&
  typeof node.props.onPointerDown == "function");

const findControlHandle = (
  wrapper: ReturnType<typeof createRenderer>,
  name: string,
) => findControlHandles(wrapper, name)[0];

const findControlArrow = (
  wrapper: ReturnType<typeof createRenderer>,
  name: string,
) => wrapper.root.find(node =>
  node.props.name == name &&
  Array.isArray(node.props.start) &&
  Array.isArray(node.props.end));

describe("scene object placement helpers", () => {
  beforeEach(() => {
    jest.spyOn(threeFiber, "useFrame").mockImplementation(() => {
      // eslint-disable-next-line no-null/no-null
      return null;
    });
  });

  it("orients greenhouse walls before rendering", () => {
    expect(greenhouseWallRenderProps(10, 10000, 2500)).toEqual({
      size: [10000, 10, 2500],
      rotation: [0, 0, Math.PI / 2],
    });
    expect(greenhouseWallRenderProps(10000, 10, 2500)).toEqual({
      size: [10000, 10, 2500],
      rotation: [0, 0, 0],
    });
  });

  it("converts scene object rotation to Z-axis radians", () => {
    expect(sceneObjectRotation(90)).toEqual([0, 0, Math.PI / 2]);
    expect(sceneObjectRotation(-90)).toEqual([0, 0, -Math.PI / 2]);
  });

  it("rotates a point around a nonzero Z-axis pivot", () => {
    const point = { x: 30, y: 20, z: 40 };
    const pivot = { x: 10, y: 20, z: 5 };
    const rotated = rotatePointAboutZ(point, pivot, Math.PI / 2);

    expect(rotated.x).toBeCloseTo(10);
    expect(rotated.y).toBeCloseTo(40);
    expect(rotated.z).toEqual(40);
    const restored = rotatePointAboutZ(rotated, pivot, -Math.PI / 2);
    expect(restored.x).toBeCloseTo(point.x);
    expect(restored.y).toBeCloseTo(point.y);
    expect(restored.z).toEqual(point.z);
  });

  it("scales scene object controls with camera distance", () => {
    expect(objectMarkerScale(0)).toEqual(1);
    expect(objectMarkerScale(3500)).toEqual(1);
    expect(objectMarkerScale(7000)).toEqual(2);
    expect(objectMarkerScale(14000)).toEqual(4);
    expect(objectMarkerScale(28000)).toEqual(4);
  });

  it("positions the rotation control beyond a rotated base corner", () => {
    const config = clone(INITIAL);
    const center = { x: 100, y: 200, z: 20 };
    const bounds = {
      x0: 50,
      y0: 100,
      z0: 20,
      x1: 150,
      y1: 300,
      z1: 100,
    };
    const points = sceneObjectRotationControlPoints(
      config, bounds, center, 90);
    const oppositePoints = sceneObjectRotationControlPoints(
      config, bounds, center, 90, 1, "x0y1");
    const pivot = new Vector3(...sceneObjectPoint(config, center));
    const corner = new Vector3(...sceneObjectPoint(config, {
      x: bounds.x1,
      y: bounds.y0,
      z: bounds.z0,
    }));

    expect(points).toHaveLength(17);
    expect(new Vector3(...points[8]).distanceTo(pivot))
      .toBeGreaterThan(corner.distanceTo(pivot));
    expect(points.every(point => point[2] == pivot.z + 5)).toEqual(true);
    expect(points[8][0] + oppositePoints[8][0])
      .toBeCloseTo(pivot.x * 2);
    expect(points[8][1] + oppositePoints[8][1])
      .toBeCloseTo(pivot.y * 2);
  });

  it("calculates rotation from the pointer angle", () => {
    const pivot = { x: 10, y: 20, z: 0 };
    const twelveDegrees = 12 * Math.PI / 180;
    const twentyDegrees = 20 * Math.PI / 180;

    expect(sceneObjectRotationFromPointer(
      30, 0, pivot, { x: 10, y: 30, z: 0 })).toEqual(120);
    expect(sceneObjectRotationFromPointer(
      30, Math.PI, pivot, { x: 10, y: 10, z: 0 })).toEqual(120);
    expect(sceneObjectRotationFromPointer(
      0,
      0,
      pivot,
      {
        x: pivot.x + Math.cos(twelveDegrees),
        y: pivot.y + Math.sin(twelveDegrees),
        z: 0,
      },
    )).toEqual(10);
    expect(sceneObjectRotationFromPointer(
      170,
      0,
      pivot,
      {
        x: pivot.x + Math.cos(twentyDegrees),
        y: pivot.y + Math.sin(twentyDegrees),
        z: 0,
      },
    )).toEqual(-170);
    expect(sceneObjectRotationFromPointer(
      -170,
      0,
      pivot,
      {
        x: pivot.x + Math.cos(-twentyDegrees),
        y: pivot.y + Math.sin(-twentyDegrees),
        z: 0,
      },
    )).toEqual(170);
  });

  it("rotates scene objects and previews about the Z axis", () => {
    const sceneObject = fakeSceneObject({ rotation: 90 });
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const preview = createRenderer(<SceneObjectPreview
      config={clone(INITIAL)}
      sceneObject={{ ...sceneObject.body, shape: "plant", rotation: -90 }} />);

    expect(wrapper.root.findAll(node =>
      node.props.rotation?.[2] === Math.PI / 2)).not.toHaveLength(0);
    expect(preview.root.findAll(node =>
      node.props.rotation?.[2] === -Math.PI / 2)).not.toHaveLength(0);
    unmountRenderer(wrapper);
    unmountRenderer(preview);
  });

  it("adds scene object rotation to greenhouse wall orientation", () => {
    const sceneObject = fakeSceneObject({
      shape: "window",
      x_size: 10,
      y_size: 100,
      rotation: 90,
    }).body;
    const wrapper = createRenderer(<SceneObjectPreview
      config={clone(INITIAL)}
      sceneObject={sceneObject} />);

    expect(wrapper.root.findAll(node =>
      node.props.rotation?.[2] === Math.PI)).not.toHaveLength(0);
    unmountRenderer(wrapper);
  });

  it("changes the appearance key when the material changes", () => {
    const sceneObject = fakeSceneObject({
      shape: "box",
      texture: "concrete",
      color: "#ffffff",
    }).body;

    expect(sceneObjectAppearanceKey(sceneObject)).not.toEqual(
      sceneObjectAppearanceKey({ ...sceneObject, texture: "wood" }));
    expect(sceneObjectAppearanceKey(sceneObject)).not.toEqual(
      sceneObjectAppearanceKey({ ...sceneObject, color: "#000000" }));
    expect(sceneObjectAppearanceKey(sceneObject)).not.toEqual(
      sceneObjectAppearanceKey({ ...sceneObject, shape: "sphere" }));
  });

  it("builds unified size updates", () => {
    expect(unifiedSizeUpdate(true, 123)).toEqual({
      x_size: 123,
      y_size: 123,
      z_size: 123,
    });
    expect(unifiedSizeUpdate(false, 123)).toEqual({});
  });

  it("applies scene object opacity and restores materials", () => {
    const first = new ThreeMeshBasicMaterial({ opacity: 0.8 });
    const second = new ThreeMeshBasicMaterial({ opacity: 0.6 });
    const object = new Object3D() as Object3D & {
      material: ThreeMeshBasicMaterial[];
    };
    object.castShadow = true;
    object.receiveShadow = true;
    object.material = [first, second];
    const shadowStates = new WeakMap<Object3D, {
      castShadow: boolean;
      receiveShadow: boolean;
    }>();
    const materialStates =
      new WeakMap<Object3D, Material | Material[]>();

    applySceneObjectOpacity(
      shadowStates, materialStates, false, 0.5, object);

    expect(object.castShadow).toEqual(false);
    expect(object.receiveShadow).toEqual(false);
    expect(object.material.map(material => material.opacity))
      .toEqual([0.4, 0.3]);
    expect(object.material.every(material => material.transparent))
      .toEqual(true);

    applySceneObjectOpacity(
      shadowStates, materialStates, true, 1, object);

    expect(object.castShadow).toEqual(true);
    expect(object.receiveShadow).toEqual(true);
    expect(object.material).toEqual([first, second]);
  });

  it("keeps bricks horizontal on every vertical box face", () => {
    const wrapper = createRenderer(<SceneObjectPreview
      config={clone(INITIAL)}
      sceneObject={fakeSceneObject({
        shape: "box",
        texture: "bricks",
      }).body} />);
    const materials = wrapper.root.findAllByType(MeshPhongMaterial);

    expect(materials).toHaveLength(6);
    expect(materials.slice(0, 2).map(material => material.props.map.rotation))
      .toEqual([Math.PI / 2, Math.PI / 2]);
    expect(materials.slice(2).map(material => material.props.map.rotation))
      .toEqual([0, 0, 0, 0]);
    unmountRenderer(wrapper);
  });

  it("calculates box bounds from a center and corner", () => {
    expect(sceneObjectCornersFromCenter(
      { x: 100, y: 200, z: 0 },
      { x: 140, y: 260, z: 0 },
    )).toEqual({
      x_0: 60,
      y_0: 140,
      z_0: 0,
      x_1: 140,
      y_1: 260,
    });
  });

  it("calculates rotated box bounds in local object axes", () => {
    expect(sceneObjectCornersFromCenter(
      { x: 100, y: 200, z: 0 },
      { x: 140, y: 260, z: 0 },
      90,
    )).toEqual({
      x_0: 40,
      y_0: 160,
      z_0: 0,
      x_1: 160,
      y_1: 240,
    });
  });

  it("calculates snapped rotation during scene object placement", () => {
    const center = { x: 100, y: 200, z: 0 };
    expect(sceneObjectPlacementRotation(
      center, { x: 200, y: 200, z: 0 })).toEqual(0);
    expect(sceneObjectPlacementRotation(
      center, { x: 100, y: 300, z: 0 })).toEqual(90);
    expect(sceneObjectPlacementRotation(
      center, { x: 90, y: 190, z: 0 })).toEqual(-135);
    expect(sceneObjectPlacementRotation(center, center, 45)).toEqual(45);
  });

  it("snaps nearby rotations to orthogonal angles", () => {
    expect(snapSceneObjectRotation(79)).toEqual(80);
    expect(snapSceneObjectRotation(80)).toEqual(90);
    expect(snapSceneObjectRotation(100)).toEqual(90);
    expect(snapSceneObjectRotation(101)).toEqual(100);
    expect(snapSceneObjectRotation(-80)).toEqual(-90);
    expect(snapSceneObjectRotation(44)).toEqual(45);
  });

  it("shows the placement rotation guide at right angles", () => {
    expect(sceneObjectRotationGuideVisible(0)).toEqual(true);
    expect(sceneObjectRotationGuideVisible(90)).toEqual(true);
    expect(sceneObjectRotationGuideVisible(-90)).toEqual(true);
    expect(sceneObjectRotationGuideVisible(180)).toEqual(true);
    expect(sceneObjectRotationGuideVisible(45)).toEqual(false);
  });

  it("increments scene object names", () => {
    const sceneObject = fakeSceneObject({ name: "Scene Object 2" });
    expect(nextSceneObjectName([sceneObject], [
      "custom",
      "Scene Object 3",
    ])).toEqual("Scene Object 4");
    expect(nextSceneObjectName(undefined, [])).toEqual("Scene Object 1");
  });

  it("preserves configured placement axes", () => {
    const sceneObject: SceneObjectFormValues = {
      ...fakeSceneObject({ x_size: 500, y_size: 600, z_size: 700 }).body,
      preserve_axes: ["x", "z"],
    };

    expect(placementAxisSize(sceneObject, "x", 100)).toEqual(500);
    expect(placementAxisSize(sceneObject, "y", 100)).toEqual(100);
    expect(placementAxisSize(sceneObject, "z", 100)).toEqual(700);
  });

  it.each([
    { axes: ["z"], clicks: 3 },
    { axes: ["x", "y"], clicks: 3 },
    { axes: ["x", "y", "z"], clicks: 2 },
    { axes: ["r"], clicks: 3 },
    { axes: ["x", "y", "r"], clicks: 2 },
    { axes: ["x", "y", "z", "r"], clicks: 1 },
  ] as { axes: ("x" | "y" | "z" | "r")[], clicks: number }[])(
    "skips preserved placement steps: $axes",
    ({ axes, clicks }) => {
      const dispatch = jest.fn((action: unknown) => Promise.resolve(action));
      const drawnSceneObject: SceneObjectFormValues = {
        ...fakeSceneObject({
          x_size: 500,
          y_size: 600,
          z_size: 700,
        }).body,
        preserve_axes: axes,
      };
      const event = (index: number) => ({
        point: new Vector3(index * 50, index * 50, index * 50),
        nativeEvent: { clientY: 100 - index * 10 },
        stopPropagation: jest.fn(),
        ray: new Ray(
          new Vector3(index * 50, index * 50, 100),
          new Vector3(0, 0, -1),
        ),
      });
      const { result } = renderHook(() => useTestSceneObjectPlacement({
        config: clone(INITIAL),
        enabled: true,
        dispatch,
        drawnSceneObject,
      }));

      for (let index = 0; index < clicks; index++) {
        act(() => result.current.onPointerMove(event(index) as never));
        act(() => result.current.onClick(event(index) as never));
        const creates = dispatch.mock.calls.filter(([action]) =>
          (action as { type?: string }).type == "INIT_RESOURCE");
        expect(creates).toHaveLength(index == clicks - 1 ? 1 : 0);
      }
      const create = dispatch.mock.calls.find(
        ([action]) => (action as { type?: string }).type == "INIT_RESOURCE",
      )?.[0] as { payload: { body: SceneObjectFormValues } };
      expect(create.payload.body).not.toHaveProperty("preserve_axes");
      expect(create.payload.body.rotation)
        .toEqual(axes.includes("r") ? 0 : 45);
      if (axes.includes("x")
        && axes.includes("y")
        && !axes.includes("z")) {
        expect(create.payload.body.z_size).toEqual(20);
      }
    },
  );

  it("positions scene objects above the ground", () => {
    const config = clone(INITIAL);
    config.bedLengthOuter = 1000;
    config.bedWidthOuter = 2000;
    config.bedHeight = 300;
    config.bedZOffset = 100;
    config.bedXOffset = 50;
    config.bedYOffset = 25;
    const sceneObject = fakeSceneObject({
      x_center: 200,
      y_center: 400,
      x_size: 200,
      y_size: 400,
      z_size: 500,
    });

    expect(sceneObjectPosition(config, sceneObject)).toEqual([
      -250,
      -575,
      -150,
    ]);
    expect(sceneObjectPosition(config, fakeSceneObject({
      z_base: 0,
      z_origin: "world",
      z_size: 100,
    }))[2]).toEqual(-350);
    expect(sceneObjectPosition(config, fakeSceneObject({
      z_base: 0,
      z_origin: "max",
      z_size: 100,
    }))[2]).toEqual(50);
    expect(sceneObjectPosition(config, fakeSceneObject({
      z_base: 0,
      z_origin: "home",
      z_size: 100,
    }))[2]).toEqual(450);
    const homePosition = sceneObjectPosition(config, fakeSceneObject({
      x_center: 0,
      y_center: 0,
    }))[0];
    const maxPosition = sceneObjectPosition(config, fakeSceneObject({
      x_center: 0,
      y_center: 0,
      x_origin: "max",
      y_origin: "max",
    }))[0];
    const worldPosition = sceneObjectPosition(config, fakeSceneObject({
      x_center: 0,
      y_center: 0,
      x_origin: "world",
      y_origin: "world",
    }))[0];
    expect(maxPosition).toBeGreaterThan(worldPosition);
    expect(worldPosition).toBeGreaterThan(homePosition);
  });

  it("positions scene object selection marker points", () => {
    const config = clone(INITIAL);
    config.bedLengthOuter = 1000;
    config.bedWidthOuter = 2000;
    config.bedHeight = 300;
    config.bedZOffset = 100;
    config.bedXOffset = 50;
    config.bedYOffset = 25;

    expect(sceneObjectPoint(config, { x: 100, y: 200, z: 0 }))
      .toEqual([-350, -775, -400]);
    expect(sceneObjectPoint(config, { x: 300, y: 600, z: 500 }))
      .toEqual([-150, -375, 100]);
    expect(sceneObjectPoint(config, { x: 200, y: 400, z: 500 }))
      .toEqual([-250, -575, 100]);
  });

  it("finds a pointer ray point at z", () => {
    const point = pointerRayPointAtZ({
      point: new Vector3(1, 1, 1),
      ray: new Ray(
        new Vector3(10, 20, 100),
        new Vector3(0, 0, -1),
      ),
    }, 40);

    expect(point.toArray()).toEqual([10, 20, 40]);
    expect(pointerRayPointAtZ({ point: new Vector3(1, 2, 3) } as never, 40)
      .toArray()).toEqual([1, 2, 3]);
    expect(pointerRayPointAtZ({
      point: new Vector3(1, 2, 3),
      ray: new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 1)),
    }, -1).toArray()).toEqual([1, 2, 3]);
  });

  it("calculates height from a pointer ray", () => {
    expect(heightFromPointerRay({
      ray: new Ray(
        new Vector3(0, 0, 100),
        new Vector3(1, 0, -1).normalize(),
      ),
    } as never, { x: 10, y: 0, z: 25 })).toEqual(65);
    expect(heightFromPointerRay({
      ray: new Ray(
        new Vector3(0, 0, 100),
        new Vector3(-1, 0, -1).normalize(),
      ),
    } as never, { x: 10, y: 0, z: 25 })).toBeUndefined();
  });

  it("calculates a scene object top resize update", () => {
    const config = clone(INITIAL);
    const sceneObject = fakeSceneObject({ z_size: 100 });
    const baseZ = sceneObject.body.z_base;
    const [baseX, baseY] = sceneObjectPoint(config, {
      x: sceneObject.body.x_center,
      y: sceneObject.body.y_center,
      z: baseZ,
    });
    const event = {
      stopPropagation: jest.fn(),
      ray: new Ray(
        new Vector3(baseX - 10, baseY - 10, baseZ + 100),
        new Vector3(1, 1, -1).normalize(),
      ),
    };

    const update = sceneObjectTopResizeUpdate(event as never, config, {
      x: sceneObject.body.x_center,
      y: sceneObject.body.y_center,
    }, sceneObject);

    expect(update.z_size).toBeGreaterThan(sceneObject.body.z_size);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(sceneObjectTopResizeUpdate({
      stopPropagation: jest.fn(),
      ray: new Ray(
        new Vector3(baseX, baseY, baseZ + 100),
        new Vector3(0, 0, -1),
      ),
    } as never, config, {
      x: sceneObject.body.x_center,
      y: sceneObject.body.y_center,
    }, sceneObject)).toEqual({ z_size: sceneObject.body.z_size });
  });

  it("handles top resize marker preview and update", () => {
    const config = clone(INITIAL);
    const sceneObject = fakeSceneObject();
    const baseZ = sceneObject.body.z_base;
    const [baseX, baseY] = sceneObjectPoint(config, {
      x: sceneObject.body.x_center,
      y: sceneObject.body.y_center,
      z: baseZ,
    });
    const event = {
      stopPropagation: jest.fn(),
      ray: new Ray(
        new Vector3(baseX - 10, baseY - 10, baseZ + 100),
        new Vector3(1, 1, -1).normalize(),
      ),
    };
    const onPreview = jest.fn();
    const updateSceneObject = jest.fn();
    const onPreviewEnd = jest.fn();
    const handlers = topResizeMarkerHandlers({
      config,
      center: { x: sceneObject.body.x_center, y: sceneObject.body.y_center },
      sceneObject,
      onPreview,
      updateSceneObject,
      onPreviewEnd,
    });

    handlers.onPointerMove(event as never);
    handlers.onPointerUp(event as never);

    expect(onPreview).toHaveBeenCalled();
    expect(updateSceneObject).toHaveBeenCalled();
    expect(onPreviewEnd).toHaveBeenCalled();
  });

  it("stops scene object marker events", () => {
    const event = {
      stopPropagation: jest.fn(),
      nativeEvent: {
        preventDefault: jest.fn(),
        stopImmediatePropagation: jest.fn(),
      },
    };

    stopSceneObjectMarkerEvent(event as never);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.nativeEvent.preventDefault).not.toHaveBeenCalled();
    expect(event.nativeEvent.stopImmediatePropagation).not.toHaveBeenCalled();
  });

  it("stops scene object marker drag events", () => {
    const event = {
      stopPropagation: jest.fn(),
      nativeEvent: {
        preventDefault: jest.fn(),
        stopImmediatePropagation: jest.fn(),
      },
    };

    stopSceneObjectMarkerDragEvent(event as never);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.nativeEvent.preventDefault).not.toHaveBeenCalled();
    expect(event.nativeEvent.stopImmediatePropagation).toHaveBeenCalled();
  });

  it("applies scene object drag preview updates", () => {
    const sceneObject = fakeSceneObject({
      y_size: 200,
      z_size: 300,
    });
    sceneObject.uuid = "matching";

    const received = sceneObjectWithDragPreview(sceneObject, {
      uuid: "matching",
      update: { x_size: 400 },
    }).body;
    expect(received.x_size).toEqual(400);
    expect(received.y_size).toEqual(200);
    expect(received.z_size).toEqual(300);
    expect(sceneObjectWithDragPreview(sceneObject, {
      uuid: "other",
      update: { x_size: 400 },
    })).toEqual(sceneObject);
  });

  it("calculates scene object move updates", () => {
    expect(sceneObjectMoveUpdate(
      { x: 100.4, y: 200.6 },
      { x: 10.4, y: -20.4 },
    )).toEqual({ x_center: 110, y_center: 180 });
  });

  it("renders edges for hovered scene objects", () => {
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      sceneObjects: [sceneObject],
      hoverSelection: { kind: "sceneObject", id: 1 },
      visible: true,
    }));

    expect(wrapper.root.findAllByProps({ className: "edges" }).length)
      .toEqual(1);
    unmountRenderer(wrapper);
  });

  it("renders greenhouse walls along the longest horizontal axis", () => {
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      sceneObjects: [fakeSceneObject({
        shape: "window",
        x_size: 10,
        y_size: 10000,
        z_size: 2500,
      })],
      hoverSelection: { kind: "sceneObject", id: 1 },
      visible: true,
    }));
    const wallGeometry = wrapper.root.findAll(node =>
      node.props.args?.join(",") == "1227.5,10,600")[0];
    const verticalFrameGeometry = wrapper.root.findAll(node =>
      node.props.args?.join(",") == "20,10,2500")[0];
    const horizontalFrameGeometry = wrapper.root.findAll(node =>
      node.props.args?.join(",") == "10000,10,20")[0];
    const wallGroup = wrapper.root.findAll(node =>
      Array.isArray(node.props.rotation) &&
      node.props.rotation[2] === Math.PI / 2);

    expect(wallGeometry).toBeTruthy();
    expect(verticalFrameGeometry).toBeTruthy();
    expect(horizontalFrameGeometry).toBeTruthy();
    expect(wallGroup.length).toEqual(3);
    unmountRenderer(wrapper);
  });

  it("renders scene object shapes", () => {
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      sceneObjects: [
        fakeSceneObject({ shape: "plant" }),
        fakeSceneObject({ shape: "tray" }),
        fakeSceneObject({ shape: "laptop" }),
        fakeSceneObject({ shape: "desk" }),
        fakeSceneObject({ shape: "solar" }),
        fakeSceneObject({ shape: "tree" }),
        fakeSceneObject({ shape: "fence" }),
        fakeSceneObject({ shape: "astronaut" }),
        fakeSceneObject({ shape: "hab" }),
        fakeSceneObject({ shape: "rover" }),
        fakeSceneObject({ shape: "cylinder" }),
        fakeSceneObject({ shape: "sphere", texture: "none" }),
        fakeSceneObject({ shape: "window", x_size: 10000, y_size: 10 }),
      ],
      visible: true,
    }));

    expect(wrapper.root.findAllByProps({ name: "desk" }).length).toBeTruthy();
    expect(wrapper.root.findAllByProps({ name: "laptop" }).length).toBeTruthy();
    expect(wrapper.root.findAllByProps({ name: "solar" }).length).toBeTruthy();
    expect(wrapper.root.findAllByProps({ name: "tree" }).length).toBeTruthy();
    expect(wrapper.root.findAllByProps({ name: "fence" }).length).toBeTruthy();
    expect(wrapper.root.findAll(node =>
      node.props.args?.join(",") == "0.5,0.5,1,32").length)
      .toEqual(2);
    expect(wrapper.root.findAll(node =>
      node.props.args?.join(",") == "0.5,32,32").length)
      .toEqual(2);
    unmountRenderer(wrapper);
  });

  it("selects scene objects when clicked", () => {
    const onSelectObject = jest.fn();
    const sceneObject = fakeSceneObject({ id: 7 });
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      sceneObjects: [sceneObject],
      onSelectObject,
      visible: true,
    }));
    const clickable = wrapper.root.findAll(node =>
      node.props.visible === true
      && typeof node.props.onClick == "function")[0];
    const event = {
      delta: 0,
      stopPropagation: jest.fn(),
    };

    act(() => clickable.props.onClick(event));
    act(() => clickable.props.onClick({ ...event, delta: 2 }));

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(onSelectObject).toHaveBeenCalledTimes(1);
    expect(onSelectObject).toHaveBeenCalledWith({
      kind: "sceneObject",
      id: 7,
    });
    unmountRenderer(wrapper);
  });

  it("shows edit controls for a popup-selected scene object", () => {
    location.pathname = Path.mock(Path.designer());
    const sceneObject = fakeSceneObject({ id: 7 });
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      sceneObjects: [sceneObject],
      selection: { kind: "sceneObject", id: 7 },
      visible: true,
    }));

    expect(findControlHandle(
      wrapper, "scene-object-rotation-control")).toBeTruthy();
    expect(findSelectionMarker(
      wrapper, "scene-object-selection-marker-0")).toBeTruthy();
    unmountRenderer(wrapper);
  });

  it("does not mount or select individually hidden scene objects", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const onSelectObject = jest.fn();
    const hiddenObject = fakeSceneObject({ id: 1, show: false });
    const shownObject = fakeSceneObject({ id: 2, show: true });
    const { container } = render(<SceneObjects
      config={{ ...clone(INITIAL), scene: "none" }}
      activeFocus={""}
      sceneObjects={[hiddenObject, shownObject]}
      hoverSelection={{ kind: "sceneObject", id: 1 }}
      onSelectObject={onSelectObject}
      visible={true} />);

    const renderedObjects = container.querySelectorAll(
      "[name='scene-object-opacity']");
    expect(renderedObjects).toHaveLength(1);
    fireEvent.click(renderedObjects[0]);
    expect(onSelectObject).toHaveBeenCalledWith({
      kind: "sceneObject",
      id: 2,
    });
  });

  it("renders static scene objects by scene", () => {
    expect(staticSceneObjects("Lab").length).toBeGreaterThan(0);
    expect(staticSceneObjects("Greenhouse").length).toBeGreaterThan(0);
    expect(staticSceneObjects("Outdoor").length).toBeGreaterThan(0);
    expect(staticSceneObjects("Mars").length).toBeGreaterThan(0);
    expect(staticSceneObjects("Outdoor", true)).toEqual([]);
    expect(staticSceneObjects("Lab")[0].uuid)
      .not.toEqual(staticSceneObjects("Greenhouse")[0].uuid);
  });

  it("renders all featured scene objects at 50% opacity", () => {
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      visible: true,
      designer: {
        featuredScene: "Outdoor",
        focusedSceneObjectField: undefined,
        unifiedSceneObjectSize: undefined,
        hoveredSceneObject: undefined,
      },
    }));
    const featuredObjects = staticSceneObjects("Outdoor");
    const translucentObjects = wrapper.root.findAll(node =>
      node.props.opacity === 0.5 && node.props.show === true);

    expect(translucentObjects).toHaveLength(featuredObjects.length);
    translucentObjects.forEach(object => {
      expect(object.props.visible).toEqual(true);
    });
    unmountRenderer(wrapper);
  });

  it("fades a selected scene object when the layer is hidden", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const sceneObject = fakeSceneObject({ show: true });
    sceneObject.body.id = 1;
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      visible: false,
      sceneObjects: [sceneObject],
    }));
    const fadedObjects = wrapper.root.findAll(node =>
      node.props.show === false && node.props.visible === true);

    expect(fadedObjects).toHaveLength(1);
    unmountRenderer(wrapper);
  });

  it("fades all user scene objects when their hidden layer is hovered", () => {
    const sceneObjects = [fakeSceneObject(), fakeSceneObject()];
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      visible: false,
      designer: {
        focusedSceneObjectField: undefined,
        hoveredSceneObject: HOVER_ALL_SCENE_OBJECTS,
        unifiedSceneObjectSize: undefined,
      },
      sceneObjects,
    }));
    const fadedObjects = wrapper.root.findAll(node =>
      node.props.show === false && node.props.visible === true);

    expect(fadedObjects).toHaveLength(sceneObjects.length);
    unmountRenderer(wrapper);
  });

  it("drags selected scene object handles", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const dispatch = jest.fn();
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      dispatch,
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const event = {
      point: new Vector3(0, 0, 0),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
      ray: new Ray(new Vector3(0, 0, 100), new Vector3(1, 1, -1)),
    };
    const moveHandle = findControlHandle(
      wrapper, "scene-object-move-handle");
    const axisObject = {
      name: "",
      parent: { name: "scene-object-base-x-axis-arrow" },
    };
    const faceArrowObject = {
      name: "",
      parent: { name: "scene-object-face-size-arrow-1" },
    };
    const faceMarkerObject = {
      name: "scene-object-selection-marker-1",
    };
    const rotationControlObject = {
      name: "scene-object-rotation-control-arc",
    };
    const interactionEvent = (object: object) => ({
      ...event,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
      intersections: [{ object }],
    });
    const blockedEvents = [
      interactionEvent(axisObject),
      interactionEvent(faceArrowObject),
      interactionEvent(faceMarkerObject),
      interactionEvent(rotationControlObject),
    ];
    const unrelatedEvent = interactionEvent({
      name: "scene-object-base-x",
      parent: { name: "not-an-axis-arrow" },
    });

    act(() => {
      blockedEvents.map(blockedEvent =>
        moveHandle.props.onPointerDown(blockedEvent));
      moveHandle.props.onPointerDown(unrelatedEvent);
      moveHandle.props.onPointerCancel(unrelatedEvent);
      moveHandle.props.onPointerDown(event);
      moveHandle.props.onPointerMove(event);
      moveHandle.props.onPointerUp(event);
      moveHandle.props.onPointerDown(event);
      moveHandle.props.onPointerCancel(event);
      moveHandle.props.onPointerDown(event);
      moveHandle.props.onLostPointerCapture(event);
    });

    expect(dispatch).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    blockedEvents.map(blockedEvent => {
      expect(blockedEvent.stopPropagation).not.toHaveBeenCalled();
      expect(blockedEvent.nativeEvent.stopImmediatePropagation)
        .not.toHaveBeenCalled();
      expect(blockedEvent.target.setPointerCapture).not.toHaveBeenCalled();
    });

    const marker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-0");
    const topMarker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-4");

    act(() => {
      marker.props.onPointerOver(event);
      marker.props.onPointerOut(event);
      marker.props.onPointerMove(event);
      marker.props.onPointerDown(event);
      marker.props.onPointerMove(event);
      marker.props.onPointerUp(event);
      marker.props.onPointerDown(event);
      window.dispatchEvent(new Event("pointerup"));
      marker.props.onPointerDown(event);
      marker.props.onPointerCancel(event);
      marker.props.onPointerDown(event);
      marker.props.onLostPointerCapture(event);
    });

    const baseZ = sceneObject.body.z_base;
    const [baseX, baseY] = sceneObjectPoint(config, {
      x: sceneObject.body.x_center,
      y: sceneObject.body.y_center,
      z: baseZ,
    });
    const topEvent = {
      ...event,
      ray: new Ray(
        new Vector3(baseX - 10, baseY - 10, baseZ + 100),
        new Vector3(1, 1, -1).normalize(),
      ),
    };

    act(() => {
      topMarker.props.onPointerDown(topEvent);
      topMarker.props.onPointerMove(topEvent);
      topMarker.props.onPointerUp(topEvent);
    });

    expect(event.stopPropagation).toHaveBeenCalled();
    unmountRenderer(wrapper);
  });

  it("drags the selected scene object top resize marker", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const dispatch = jest.fn();
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      dispatch,
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const baseZ = sceneObject.body.z_base;
    const [baseX, baseY] = sceneObjectPoint(config, {
      x: sceneObject.body.x_center,
      y: sceneObject.body.y_center,
      z: baseZ,
    });
    const event = {
      point: new Vector3(0, 0, 0),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
      ray: new Ray(
        new Vector3(baseX - 10, baseY - 10, baseZ + 100),
        new Vector3(1, 1, -1).normalize(),
      ),
    };
    const topMarker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-4");

    act(() => {
      topMarker.props.onPointerDown(event);
    });
    act(() => {
      topMarker.props.onPointerMove(event);
    });
    act(() => {
      topMarker.props.onPointerUp(event);
    });

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalled();
    unmountRenderer(wrapper);
  });

  it("drags a selected scene object face resize marker", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const dispatch = jest.fn();
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      dispatch,
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const [targetX, targetY] = sceneObjectPoint(config, {
      x: 200,
      y: sceneObject.body.y_center,
      z: sceneObject.body.z_base,
    });
    const event = {
      point: new Vector3(0, 0, 0),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
    };
    const xMaxMarker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-1");
    const [markerX, markerY, markerZ] =
      positionArray(xMaxMarker.props.position);
    event.point = new Vector3(targetX, targetY, markerZ);
    const downEvent = {
      ...event,
      point: new Vector3(markerX, markerY, markerZ),
    };

    act(() => {
      xMaxMarker.props.onPointerDown(downEvent);
    });
    const draggedXMaxMarker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-1");
    act(() => {
      draggedXMaxMarker.props.onPointerMove(event);
      draggedXMaxMarker.props.onPointerUp(event);
    });

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "EDIT_RESOURCE",
      payload: expect.objectContaining({
        update: {
          x_center: 100,
          x_size: 200,
        },
      }),
    }));
    unmountRenderer(wrapper);
  });

  it("drags a rotated face along the object's local axis", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const dispatch = jest.fn();
    const sceneObject = fakeSceneObject({
      x_center: 100,
      y_center: 200,
      x_size: 100,
      y_size: 200,
      rotation: 90,
      x_origin: "home",
      y_origin: "home",
    });
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      dispatch,
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const marker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-1");
    const [markerX, markerY, markerZ] =
      positionArray(marker.props.position);
    const pivotArray = sceneObjectPoint(config, {
      x: 100,
      y: 200,
      z: sceneObject.body.z_base,
    });
    const pivot = {
      x: pivotArray[0], y: pivotArray[1], z: pivotArray[2],
    };
    const targetArray = sceneObjectPoint(config, {
      x: 250,
      y: 200,
      z: sceneObject.body.z_base,
    });
    const target = rotatePointAboutZ({
      x: targetArray[0], y: targetArray[1], z: markerZ,
    }, pivot, Math.PI / 2);
    const event = {
      point: new Vector3(target.x, target.y, target.z),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
    };

    act(() => {
      marker.props.onPointerDown({
        ...event,
        point: new Vector3(markerX, markerY, markerZ),
      });
    });
    act(() => {
      const draggedMarker = findSelectionMarker(
        wrapper, "scene-object-selection-marker-1");
      draggedMarker.props.onPointerMove(event);
      draggedMarker.props.onPointerUp(event);
    });

    const localCenter = sceneObjectPoint(config, {
      x: 150,
      y: 200,
      z: sceneObject.body.z_base,
    });
    const rotatedCenter = rotatePointAboutZ({
      x: localCenter[0], y: localCenter[1], z: localCenter[2],
    }, pivot, Math.PI / 2);
    const expectedCenter = getGardenPositionFunc(config)(rotatedCenter);
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "EDIT_RESOURCE",
      payload: expect.objectContaining({
        update: {
          x_center: expectedCenter.x,
          y_center: expectedCenter.y,
          x_size: 200,
        },
      }),
    }));
    unmountRenderer(wrapper);
  });

  it("drags a selected scene object y face resize marker", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const dispatch = jest.fn();
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      dispatch,
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const [targetX, targetY] = sceneObjectPoint(config, {
      x: sceneObject.body.x_center,
      y: 250,
      z: sceneObject.body.z_base,
    });
    const yMaxMarker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-3");
    const [markerX, markerY, markerZ] =
      positionArray(yMaxMarker.props.position);
    const event = {
      point: new Vector3(targetX, targetY, markerZ),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
    };

    act(() => {
      yMaxMarker.props.onPointerDown({
        ...event,
        point: new Vector3(markerX, markerY, markerZ),
      });
    });
    const draggedYMaxMarker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-3");
    act(() => {
      draggedYMaxMarker.props.onPointerMove(event);
      draggedYMaxMarker.props.onPointerUp(event);
    });

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "EDIT_RESOURCE",
      payload: expect.objectContaining({
        update: {
          y_center: 130,
          y_size: 250,
        },
      }),
    }));
    unmountRenderer(wrapper);
  });

  it("doesn't jump when starting selected scene object face marker drag", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const dispatch = jest.fn();
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      dispatch,
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const xMaxMarker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-1");
    const [markerX, markerY, markerZ] =
      positionArray(xMaxMarker.props.position);
    const event = {
      point: new Vector3(markerX, markerY, markerZ),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
      ray: new Ray(
        new Vector3(markerX - 100, markerY, markerZ + 100),
        new Vector3(1, 0, -1).normalize(),
      ),
    };

    act(() => {
      xMaxMarker.props.onPointerDown(event);
      xMaxMarker.props.onPointerUp(event);
    });

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "EDIT_RESOURCE",
      payload: expect.objectContaining({
        update: {
          x_center: sceneObject.body.x_center,
          x_size: sceneObject.body.x_size,
        },
      }),
    }));
    unmountRenderer(wrapper);
  });

  it("positions side resize markers in the middle of each face", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const sceneObject = fakeSceneObject({ z_base: 20, z_size: 80 });
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      designer: {
        focusedSceneObjectField: "z_base",
        unifiedSceneObjectSize: undefined,
        hoveredSceneObject: undefined,
      },
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const markers = [0, 1, 2, 3].map(index =>
      findSelectionMarker(wrapper, `scene-object-selection-marker-${index}`));

    expect(markers.slice(0, 4).map(marker => marker.props.position[2]))
      .toEqual(Array(4).fill(
        sceneObjectPoint(config, {
          x: sceneObject.body.x_center,
          y: sceneObject.body.y_center,
          z: 60,
        })[2],
      ));
    unmountRenderer(wrapper);
  });

  it("rotates size markers and arrows around the object center", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const sceneObject = fakeSceneObject({
      x_center: 100,
      y_center: 200,
      z_base: 20,
      x_size: 100,
      y_size: 200,
      z_size: 80,
      rotation: 90,
    });
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const pivotArray = sceneObjectPoint(config, {
      x: 100, y: 200, z: 20,
    });
    const pivot = {
      x: pivotArray[0], y: pivotArray[1], z: pivotArray[2],
    };
    const rotatedPoint = (point: {
      x: number, y: number, z: number,
    }): [number, number, number] => {
      const [x, y, z] = sceneObjectPoint(config, point);
      const rotated = rotatePointAboutZ(
        { x, y, z }, pivot, Math.PI / 2);
      return [rotated.x, rotated.y, rotated.z];
    };
    const xFace = findSelectionMarker(
      wrapper, "scene-object-selection-marker-1");
    const yFace = findSelectionMarker(
      wrapper, "scene-object-selection-marker-3");
    const top = findSelectionMarker(
      wrapper, "scene-object-selection-marker-4");
    const uniform = findSelectionMarker(
      wrapper, "scene-object-selection-marker-5");
    const expectedXFace = rotatedPoint({ x: 150, y: 200, z: 60 });
    const expectedYFace = rotatedPoint({ x: 100, y: 300, z: 60 });
    const expectedUniform = rotatedPoint({ x: 150, y: 300, z: 100 });

    positionArray(xFace.props.position).map((value, index) =>
      expect(value).toBeCloseTo(expectedXFace[index]));
    positionArray(yFace.props.position).map((value, index) =>
      expect(value).toBeCloseTo(expectedYFace[index]));
    positionArray(uniform.props.position).map((value, index) =>
      expect(value).toBeCloseTo(expectedUniform[index]));
    expect(positionArray(top.props.position).slice(0, 2))
      .toEqual(pivotArray.slice(0, 2));

    const xArrow = findControlArrow(
      wrapper, "scene-object-face-size-arrow-1-arrow").props;
    const topArrow = findControlArrow(
      wrapper, "scene-object-face-size-arrow-4-arrow").props;
    const uniformArrow = findControlArrow(
      wrapper, "scene-object-face-size-arrow-5-arrow").props;
    expect(positionArray(xArrow.end)[1])
      .toBeGreaterThan(positionArray(xArrow.start)[1]);
    expect(positionArray(topArrow.end).slice(0, 2))
      .toEqual(positionArray(topArrow.start).slice(0, 2));
    expect(positionArray(uniformArrow.end)[0])
      .toBeLessThan(positionArray(uniformArrow.start)[0]);
    expect(positionArray(uniformArrow.end)[1])
      .toBeGreaterThan(positionArray(uniformArrow.start)[1]);
    unmountRenderer(wrapper);
  });

  it("renders and drags the scene object rotation control", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const dispatch = jest.fn();
    const sceneObject = fakeSceneObject({
      x_center: 100,
      y_center: 200,
      z_base: 20,
      rotation: 10,
      x_origin: "home",
      y_origin: "home",
      z_origin: "world",
    });
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      dispatch,
      sceneObjects: [sceneObject],
      visible: true,
    }));
    expect(wrapper.root.findAllByProps({
      name: "scene-object-edit-rotation-guide",
    })).toHaveLength(0);
    expect(wrapper.root.findAll(node =>
      node.type == "mesh" as ElementType &&
      node.props.name == "scene-object-rotation-control-arc"))
      .toHaveLength(2);
    const startHeads = wrapper.root.findAllByProps({
      name: "scene-object-rotation-control-start",
    });
    expect(startHeads).toHaveLength(4);
    expect(startHeads[0].props.args).toEqual([20, 60, 16]);
    expect(wrapper.root.findAllByProps({
      name: "scene-object-rotation-control-end",
    })).toHaveLength(4);
    const tubes = wrapper.root.findAll(node =>
      node.type == "tubeGeometry" as ElementType);
    expect(tubes).toHaveLength(2);
    expect(tubes[0].props.args.slice(1)).toEqual([16, 10, 8, false]);
    expect(findControlHandles(
      wrapper, "scene-object-rotation-control")).toHaveLength(2);
    const [pivotX, pivotY, pivotZ] = sceneObjectPoint(config, {
      x: sceneObject.body.x_center,
      y: sceneObject.body.y_center,
      z: sceneObject.body.z_base,
    });
    const event = (point: Vector3) => ({
      point,
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
    });

    act(() => {
      findControlHandle(wrapper, "scene-object-rotation-control")
        .props.onPointerOver({
          stopPropagation: jest.fn(),
        });
    });
    const label = wrapper.root.findAllByProps({
      name: "scene-object-rotation-control-label",
    })[0];
    expect(label.props.children).toEqual("10°");
    expect(label.props.fontSize).toEqual(32);
    act(() => {
      findControlHandle(wrapper, "scene-object-rotation-control")
        .props.onPointerDown(event(
          new Vector3(pivotX + 100, pivotY, pivotZ)));
    });
    act(() => {
      findControlHandle(wrapper, "scene-object-rotation-control")
        .props.onPointerMove(event(
          new Vector3(pivotX, pivotY + 100, pivotZ)));
    });
    expect(wrapper.root.findAllByProps({
      name: "scene-object-rotation-control-label",
    })[0].props.children).toEqual("90°");
    const guide = wrapper.root.findByProps({
      name: "scene-object-edit-rotation-guide",
    });
    expect(guide.props.color).toEqual("orange");
    expect(guide.props.points[0][0])
      .toBeCloseTo(guide.props.points[1][0] as number);
    act(() => {
      findControlHandle(wrapper, "scene-object-rotation-control")
        .props.onPointerUp(event(
          new Vector3(pivotX, pivotY + 100, pivotZ)));
    });
    expect(wrapper.root.findAllByProps({
      name: "scene-object-edit-rotation-guide",
    })).toHaveLength(0);

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "EDIT_RESOURCE",
      payload: expect.objectContaining({
        update: { rotation: 90 },
      }),
    }));
    unmountRenderer(wrapper);
  });

  it("positions selected scene object origin markers", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const config = clone(INITIAL);
    const sceneObject = fakeSceneObject({
      x_center: 10,
      y_center: 20,
      z_base: 30,
      x_origin: "max",
      y_origin: "world",
      z_origin: "home",
    });
    sceneObject.body.id = 1;
    const center = {
      x: sceneObject.body.x_center + config.bedLengthOuter,
      y: sceneObject.body.y_center + config.bedWidthOuter / 2,
      z: sceneObject.body.z_base
        + config.bedHeight
        + config.bedZOffset
        + zZero(config),
    };
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const objectBase = sceneObjectPoint(config, center);
    const zOrigin = sceneObjectPoint(config, {
      x: center.x,
      y: center.y,
      z: config.bedHeight + config.bedZOffset + zZero(config),
    });
    const yOrigin = sceneObjectPoint(config, {
      x: center.x,
      y: config.bedWidthOuter / 2,
      z: config.bedHeight + config.bedZOffset + zZero(config),
    });
    const xOrigin = sceneObjectPoint(config, {
      x: config.bedLengthOuter,
      y: config.bedWidthOuter / 2,
      z: config.bedHeight + config.bedZOffset + zZero(config),
    });
    const yOriginArrowEnd = sceneObjectPoint(config, {
      x: center.x,
      y: center.y,
      z: config.bedHeight + config.bedZOffset + zZero(config),
    });
    const xOriginArrowStart = sceneObjectPoint(config, {
      x: config.bedLengthOuter,
      y: config.bedWidthOuter / 2,
      z: config.bedHeight + config.bedZOffset + zZero(config),
    });
    const xOriginArrowEnd = sceneObjectPoint(config, {
      x: center.x,
      y: config.bedWidthOuter / 2,
      z: config.bedHeight + config.bedZOffset + zZero(config),
    });

    expect(wrapper.root.findAllByProps({
      name: "scene-object-z-origin-marker",
    })).toEqual([]);
    expect(wrapper.root.findAllByProps({
      name: "scene-object-y-origin-marker",
    })).toEqual([]);
    expect(wrapper.root.findByProps({
      name: "scene-object-x-origin-marker",
    }).props.position).toEqual(xOrigin);
    expect(wrapper.root.findByProps({
      name: "scene-object-base-marker",
    }).props.position).toEqual(objectBase);
    expect(wrapper.root.findByProps({
      name: "scene-object-base-marker",
    }).props.renderOrder).toEqual(1001);
    ["x", "y", "z"].map(axis =>
      expect(wrapper.root.findByProps({
        name: `scene-object-base-${axis}-axis-arrow-shape`,
      }).props.renderOrder).toEqual(1003));
    ["x", "y", "z"].map(axis => {
      const arrow = findControlArrow(
        wrapper, `scene-object-base-${axis}-axis-arrow-shape`);
      expect(arrow.props.renderOnTop).toEqual(true);
    });
    const baseMarker = wrapper.root.find(node =>
      node.props.name == "scene-object-base-marker"
      && typeof node.props.radius == "number");
    expect(baseMarker.props.renderOnTop).toEqual(true);
    expect(findControlArrow(
      wrapper, "scene-object-z-origin-arrow").props.start).toEqual(zOrigin);
    expect(findControlArrow(
      wrapper, "scene-object-z-origin-arrow").props.end).toEqual(objectBase);
    expect(wrapper.root.findAll(node =>
      node.props.name == "scene-object-z-origin-arrow" &&
      node.props.renderOrder == 1002)[0]).toBeTruthy();
    expect(findControlArrow(
      wrapper, "scene-object-y-origin-arrow").props.start).toEqual(yOrigin);
    expect(findControlArrow(
      wrapper, "scene-object-y-origin-arrow").props.end)
      .toEqual(yOriginArrowEnd);
    expect(findControlArrow(
      wrapper, "scene-object-x-origin-arrow").props.start)
      .toEqual(xOriginArrowStart);
    expect(findControlArrow(
      wrapper, "scene-object-x-origin-arrow").props.end)
      .toEqual(xOriginArrowEnd);
    ["x", "y", "z"].map(axis => {
      const arrow = findControlArrow(
        wrapper, `scene-object-${axis}-origin-arrow`);
      expect(arrow.props.labelVisible).toEqual(false);
      expect(arrow.props.renderOnTop).toEqual(true);
      expect(arrow.props.labelDepthTest).toEqual(false);
      expect(arrow.props.labelDepthWrite).toEqual(false);
    });
    const originMarker = wrapper.root.find(node =>
      node.props.name == "scene-object-x-origin-marker"
      && typeof node.props.radius == "number");
    expect(originMarker.props.renderOnTop).toEqual(true);
    unmountRenderer(wrapper);
  });

  it("renders selected scene object face size arrows", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const dispatch = jest.fn();
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      dispatch,
      sceneObjects: [sceneObject],
      visible: true,
    }));

    [0, 1, 2, 3, 4].map(index =>
      expect(wrapper.root.findByProps({
        name: `scene-object-face-size-arrow-${index}`,
      })).toBeTruthy());
    expect(wrapper.root.findByProps({
      name: "scene-object-face-size-arrow-0",
    }).props.renderOrder).toBeUndefined();
    expect(wrapper.root.findByProps({
      name: "scene-object-face-size-arrow-0-arrow",
    }).props.renderOrder).toEqual(1004);
    expect(findSelectionMarker(
      wrapper, "scene-object-selection-marker-0")).toBeTruthy();
    expect(findSelectionMarker(
      wrapper, "scene-object-selection-marker-0")
      .findAll(node =>
        node.props.color == "dodgerblue"
        && node.props.depthTest == true
        && node.props.depthWrite == true).length).toBeGreaterThan(0);
    expect(wrapper.root.findByProps({
      name: "scene-object-face-size-arrow-0-arrow",
    }).findAllByProps({
      depthTest: true,
      depthWrite: true,
    }).length).toBeGreaterThan(0);
    const negativeXArrow = wrapper.root.findByProps({
      name: "scene-object-face-size-arrow-0-arrow",
    }).props;
    const positiveXArrow = wrapper.root.findByProps({
      name: "scene-object-face-size-arrow-1-arrow",
    }).props;
    expect(positionArray(negativeXArrow.end)[0])
      .toBeLessThan(positionArray(negativeXArrow.start)[0]);
    expect(positionArray(positiveXArrow.end)[0])
      .toBeGreaterThan(positionArray(positiveXArrow.start)[0]);
    expect(findControlArrow(
      wrapper, "scene-object-face-size-arrow-0-arrow")
      .props.labelVisible).toEqual(false);
    act(() => {
      wrapper.root.findAll(node =>
        node.type == "group" as ElementType &&
        node.props.name == "scene-object-face-size-arrow-1" &&
        typeof node.props.onPointerOver == "function")[0]
        .props.onPointerOver({ stopPropagation: jest.fn() });
    });
    expect(findControlArrow(
      wrapper, "scene-object-face-size-arrow-1-arrow")
      .props.labelVisible).toEqual(true);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_FOCUSED_SCENE_OBJECT_FIELD,
      payload: "x_size",
    });
    const arrow = wrapper.root.findAll(node =>
      node.type == "group" as ElementType &&
      node.props.name == "scene-object-face-size-arrow-1" &&
      typeof node.props.onPointerDown == "function")[0];
    act(() => {
      arrow.props.onPointerDown({
        point: new Vector3(0, 0, 0),
        pointerId: 1,
        stopPropagation: jest.fn(),
        nativeEvent: { stopImmediatePropagation: jest.fn() },
        target: { setPointerCapture: jest.fn() },
        ray: new Ray(new Vector3(0, 0, 100), new Vector3(0, 0, -1)),
      });
    });
    dispatch.mockClear();
    act(() => {
      findControlHandle(wrapper, "scene-object-base-x-axis-arrow")
        .props.onPointerOver({ stopPropagation: jest.fn() });
      expect(dispatch).not.toHaveBeenCalledWith({
        type: Actions.SET_FOCUSED_SCENE_OBJECT_FIELD,
        payload: "x_center",
      });
      wrapper.root.findAll(node =>
        node.type == "group" as ElementType &&
        node.props.name == "scene-object-face-size-arrow-1" &&
        typeof node.props.onPointerOut == "function")[0]
        .props.onPointerOut({ stopPropagation: jest.fn() });
    });
    expect(dispatch).not.toHaveBeenCalledWith({
      type: Actions.SET_FOCUSED_SCENE_OBJECT_FIELD,
      payload: undefined,
    });
    act(() => {
      wrapper.root.findAll(node =>
        node.type == "group" as ElementType &&
        node.props.name == "scene-object-face-size-arrow-1" &&
        typeof node.props.onPointerUp == "function")[0]
        .props.onPointerUp({
          point: new Vector3(0, 0, 0),
          pointerId: 1,
          stopPropagation: jest.fn(),
          nativeEvent: { stopImmediatePropagation: jest.fn() },
          target: { releasePointerCapture: jest.fn() },
          ray: new Ray(new Vector3(0, 0, 100), new Vector3(0, 0, -1)),
        });
    });
    expect(findSelectionMarker(
      wrapper, "scene-object-selection-marker-1").props.args[0])
      .toBeGreaterThan(35);
    act(() => {
      wrapper.root.findAll(node =>
        node.type == "group" as ElementType &&
        node.props.name == "scene-object-face-size-arrow-1" &&
        typeof node.props.onPointerOut == "function")[0]
        .props.onPointerOut({ stopPropagation: jest.fn() });
    });
    expect(findControlArrow(
      wrapper, "scene-object-face-size-arrow-1-arrow")
      .props.labelVisible).toEqual(false);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_FOCUSED_SCENE_OBJECT_FIELD,
      payload: undefined,
    });
    expect(wrapper.root.findAllByType(Cone).length).toBeGreaterThan(0);
    expect(wrapper.root.findAllByType(Cylinder).length).toBeGreaterThan(0);
    unmountRenderer(wrapper);
  });

  it("renders selected scene object labels for focused form fields", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      designer: {
        focusedSceneObjectField: "x_size",
        unifiedSceneObjectSize: undefined,
        hoveredSceneObject: undefined,
      },
      sceneObjects: [sceneObject],
      visible: true,
    }));

    expect(findControlHandle(
      wrapper, "scene-object-face-size-arrow-0")
      .findAllByProps({
        name: "scene-object-face-size-arrow-0-label",
      }).length).toBeGreaterThan(0);
    expect(findControlHandle(
      wrapper, "scene-object-face-size-arrow-1")
      .findAllByProps({
        name: "scene-object-face-size-arrow-1-label",
      }).length).toBeGreaterThan(0);
    expect(findControlHandle(
      wrapper, "scene-object-face-size-arrow-2")
      .findByProps({
        name: "scene-object-face-size-arrow-2-arrow",
      }).props.labelVisible).toEqual(false);
    unmountRenderer(wrapper);
  });

  it("hovers the selected scene object top resize marker", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const topMarker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-4");
    const event = {
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
    };

    act(() => {
      topMarker.props.onPointerOver(event);
    });
    const hoveredMarker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-4");
    expect(hoveredMarker).toBeTruthy();
    act(() => {
      hoveredMarker.props.onPointerOut(event);
    });
    act(() => {
      topMarker.props.onPointerDown(event);
    });
    act(() => {
      findSelectionMarker(wrapper, "scene-object-selection-marker-4")
        .props.onPointerCancel(event);
    });

    expect(event.stopPropagation).toHaveBeenCalledTimes(4);
    unmountRenderer(wrapper);
  });

  it("uses minimum world sizing for selected scene object controls", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;

    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      sceneObjects: [sceneObject],
      visible: true,
    }));

    expect(findSelectionMarker(
      wrapper, "scene-object-selection-marker-0").props.args[0])
      .toEqual(35);
    expect(findControlArrow(
      wrapper, "scene-object-face-size-arrow-0-arrow").props.width)
      .toEqual(20);
    expect(findControlArrow(
      wrapper, "scene-object-base-x-axis-arrow-shape").props.width)
      .toEqual(10);
    expect(findControlArrow(
      wrapper, "scene-object-x-origin-arrow").props.width)
      .toEqual(10);
    const sizeArrow = findControlArrow(
      wrapper, "scene-object-face-size-arrow-0-arrow").props;
    expect(Math.abs(sizeArrow.end[0] - sizeArrow.start[0])).toEqual(250);
    const markerEvent = {
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
    };
    act(() => {
      findControlHandle(wrapper, "scene-object-base-marker-control")
        .props.onPointerDown(markerEvent);
    });
    expect(markerEvent.stopPropagation).not.toHaveBeenCalled();
    unmountRenderer(wrapper);
  });

  it("scales selected scene object controls with camera distance", () => {
    const frameCallbacks: (() => void)[] = [];
    const useFrameSpy = jest.spyOn(threeFiber, "useFrame")
      .mockImplementation(callback => {
        frameCallbacks.push(callback as () => void);
        // eslint-disable-next-line no-null/no-null
        return null;
      });
    const useThreeSpy = jest.spyOn(threeFiber, "useThree")
      .mockReturnValue({
        camera: { position: { x: 100000, y: 0, z: 0 } },
      });
    location.pathname = Path.mock(Path.sceneObjects(1));
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      designer: {
        focusedSceneObjectField: "rotation",
        hoveredSceneObject: undefined,
        unifiedSceneObjectSize: undefined,
      },
      sceneObjects: [sceneObject],
      visible: true,
    }));

    act(() => {
      frameCallbacks.slice().map(callback => callback());
    });

    expect(findSelectionMarker(
      wrapper, "scene-object-selection-marker-0").props.args[0])
      .toEqual(140);
    const faceArrow = findControlArrow(
      wrapper, "scene-object-face-size-arrow-0-arrow").props;
    expect(faceArrow.width).toEqual(80);
    expect(faceArrow.labelSize).toEqual(128);
    expect(Math.abs(faceArrow.end[0] - faceArrow.start[0])).toEqual(1000);
    expect(findControlArrow(
      wrapper, "scene-object-base-x-axis-arrow-shape").props.width)
      .toEqual(40);
    expect(findControlArrow(
      wrapper, "scene-object-x-origin-arrow").props.width)
      .toEqual(40);
    expect(wrapper.root.findAllByProps({
      name: "scene-object-rotation-control-start",
    })[0].props.args).toEqual([80, 240, 16]);
    const rotationTube = wrapper.root.findAll(node =>
      node.type == "tubeGeometry" as ElementType);
    expect(rotationTube[0].props.args[2]).toEqual(40);
    expect(wrapper.root.findAllByProps({
      name: "scene-object-rotation-control-label",
    })[0].props.fontSize).toEqual(128);
    unmountRenderer(wrapper);
    useFrameSpy.mockRestore();
    useThreeSpy.mockRestore();
  });

  it("drags a selected scene object face size arrow", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const dispatch = jest.fn();
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      dispatch,
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const arrow = wrapper.root.findAll(node =>
      node.type == "group" as ElementType &&
      node.props.name == "scene-object-face-size-arrow-1")[0];
    const xMaxMarker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-1");
    const [markerX, markerY, markerZ] =
      positionArray(xMaxMarker.props.position);
    const [targetX, targetY, targetZ] = sceneObjectPoint(config, {
      x: 200,
      y: sceneObject.body.y_center,
      z: sceneObject.body.z_base,
    });
    const downEvent = {
      point: new Vector3(markerX, markerY, markerZ),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: { setPointerCapture: jest.fn() },
      ray: new Ray(
        new Vector3(markerX, markerY, markerZ + 100),
        new Vector3(0, 0, -1),
      ),
    };
    const dragEvent = {
      ...downEvent,
      target: {
        ...downEvent.target,
        releasePointerCapture: jest.fn(),
      },
      ray: new Ray(
        new Vector3(targetX, targetY, targetZ + 100),
        new Vector3(0, 0, -1),
      ),
    };

    act(() => {
      arrow.props.onPointerDown(downEvent);
      arrow.props.onPointerMove(dragEvent);
      arrow.props.onPointerUp(dragEvent);
    });

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "EDIT_RESOURCE",
      payload: expect.objectContaining({
        update: {
          x_center: 100,
          x_size: 200,
        },
      }),
    }));
    unmountRenderer(wrapper);
  });

  it("only shows and drags the xyz size arrow when cube mode is active", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const dispatch = jest.fn();
    const sceneObject = fakeSceneObject({
      x_size: 100,
      y_size: 200,
      z_size: 300,
    });
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      dispatch,
      sceneObjects: [sceneObject],
      designer: {
        focusedSceneObjectField: undefined,
        unifiedSceneObjectSize: sceneObject.uuid,
        hoveredSceneObject: undefined,
      },
      visible: true,
    }));
    expect(wrapper.root.findAllByProps({
      name: "scene-object-face-size-arrow-1",
    })).toEqual([]);
    expect(wrapper.root.findAllByProps({
      name: "scene-object-face-size-arrow-4",
    })).toEqual([]);
    expect(wrapper.root.findAllByProps({
      name: "scene-object-selection-marker-1",
    })).toEqual([]);
    const arrow = wrapper.root.findAll(node =>
      node.type == "group" as ElementType &&
      node.props.name == "scene-object-face-size-arrow-0")[0];
    const marker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-0");
    const [markerX, markerY, markerZ] = positionArray(marker.props.position);
    const event = (delta: number) => ({
      point: new Vector3(markerX + delta, markerY + delta, markerZ + delta),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
    });

    act(() => {
      arrow.props.onPointerDown(event(0));
    });
    act(() => {
      wrapper.root.findAll(node =>
        node.type == "group" as ElementType &&
        node.props.name == "scene-object-face-size-arrow-0")[0]
        .props.onPointerUp(event(150));
    });
    const update = dispatch.mock.calls.find(call =>
      call[0].type == "EDIT_RESOURCE")?.[0].payload.update;

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "EDIT_RESOURCE",
      payload: expect.objectContaining({
        update: expect.objectContaining({
          x_size: 200,
          y_size: 400,
          z_size: 600,
        }),
      }),
    }));
    expect(update.x_center).toBeUndefined();
    expect(update.y_center).toBeUndefined();
    unmountRenderer(wrapper);
  });

  it("drags all scene object sizes from the xyz size arrow", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const dispatch = jest.fn();
    const sceneObject = fakeSceneObject({
      x_size: 100,
      y_size: 200,
      z_size: 300,
    });
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      dispatch,
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const arrow = wrapper.root.findAll(node =>
      node.type == "group" as ElementType &&
      node.props.name == "scene-object-face-size-arrow-5")[0];
    act(() => {
      arrow.props.onPointerOver({ stopPropagation: jest.fn() });
    });
    expect(arrow.findByProps({
      name: "scene-object-face-size-arrow-5-arrow",
    }).props.labelVisible).toEqual(false);
    const marker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-5");
    const [markerX, markerY, markerZ] = positionArray(marker.props.position);
    const event = (delta: number) => ({
      point: new Vector3(markerX + delta, markerY + delta, markerZ + delta),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
      ray: new Ray(
        new Vector3(markerX + delta, markerY + delta, markerZ + delta + 100),
        new Vector3(0, 0, -1),
      ),
    });

    act(() => {
      arrow.props.onPointerDown(event(0));
    });
    act(() => {
      wrapper.root.findAll(node =>
        node.type == "group" as ElementType &&
        node.props.name == "scene-object-face-size-arrow-5")[0]
        .props.onPointerMove(event(75));
    });
    act(() => {
      wrapper.root.findAll(node =>
        node.type == "group" as ElementType &&
        node.props.name == "scene-object-face-size-arrow-5")[0]
        .props.onPointerUp(event(150));
    });
    const update = dispatch.mock.calls.find(call =>
      call[0].type == "EDIT_RESOURCE")?.[0].payload.update;

    expect(update).toEqual({
      x_size: 200,
      y_size: 400,
      z_size: 600,
    });
    act(() => {
      const currentArrow = wrapper.root.findAll(node =>
        node.type == "group" as ElementType &&
        node.props.name == "scene-object-face-size-arrow-5")[0];
      currentArrow.props.onPointerDown(event(0));
      currentArrow.props.onPointerCancel(event(150));
    });
    unmountRenderer(wrapper);
  });

  it("drags all sizes along the rotated xyz size arrow", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const dispatch = jest.fn();
    const sceneObject = fakeSceneObject({
      x_size: 100,
      y_size: 200,
      z_size: 300,
      rotation: 90,
    });
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      dispatch,
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const marker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-5");
    const markerPosition = new Vector3(
      ...positionArray(marker.props.position));
    const arrow = findControlArrow(
      wrapper, "scene-object-face-size-arrow-5-arrow");
    const direction = new Vector3(
      ...positionArray(arrow.props.end),
    ).sub(new Vector3(
      ...positionArray(arrow.props.start),
    )).normalize();
    const event = (distance: number) => ({
      point: markerPosition.clone().addScaledVector(direction, distance),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
    });

    act(() => {
      marker.props.onPointerDown(event(0));
    });
    act(() => {
      const draggedMarker = findSelectionMarker(
        wrapper, "scene-object-selection-marker-5");
      draggedMarker.props.onPointerMove(event(75));
      draggedMarker.props.onPointerUp(event(300 * Math.sqrt(3) / 2));
    });

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "EDIT_RESOURCE",
      payload: expect.objectContaining({
        update: {
          x_size: 200,
          y_size: 400,
          z_size: 600,
        },
      }),
    }));
    unmountRenderer(wrapper);
  });

  it("drags a selected scene object z size arrow from its start size", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const dispatch = jest.fn();
    const sceneObject = fakeSceneObject({ z_size: 100 });
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      dispatch,
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const arrow = wrapper.root.findAll(node =>
      node.type == "group" as ElementType &&
      node.props.name == "scene-object-face-size-arrow-4")[0];
    const [baseX, baseY, baseZ] = sceneObjectPoint(config, {
      x: sceneObject.body.x_center,
      y: sceneObject.body.y_center,
      z: sceneObject.body.z_base,
    });
    const event = (height: number) => ({
      point: new Vector3(0, 0, 0),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: {
        stopImmediatePropagation: jest.fn(),
      },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
      ray: new Ray(
        new Vector3(baseX - 10, baseY, baseZ + height + 10),
        new Vector3(1, 0, -1).normalize(),
      ),
    });

    act(() => {
      arrow.props.onPointerDown(event(50));
    });
    act(() => {
      wrapper.root.findAll(node =>
        node.type == "group" as ElementType &&
        node.props.name == "scene-object-face-size-arrow-4")[0]
        .props.onPointerMove(event(50));
    });
    expect(findControlArrow(
      wrapper, "scene-object-face-size-arrow-4-arrow")
      .props.label).toEqual("100mm");
    act(() => {
      wrapper.root.findAll(node =>
        node.type == "group" as ElementType &&
        node.props.name == "scene-object-face-size-arrow-4")[0]
        .props.onPointerUp(event(70));
    });
    const update = dispatch.mock.calls.find(call =>
      call[0].type == "EDIT_RESOURCE")?.[0].payload.update;

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "EDIT_RESOURCE",
      payload: expect.objectContaining({
        update: { z_size: 120 },
      }),
    }));
    expect(update.x_center).toBeUndefined();
    expect(update.y_center).toBeUndefined();
    const externallyUpdatedSceneObject = {
      ...sceneObject,
      body: {
        ...sceneObject.body,
        z_size: 180,
      },
    };
    act(() => {
      wrapper.update(React.createElement(SceneObjects, {
        config,
        activeFocus: "",
        dispatch,
        sceneObjects: [externallyUpdatedSceneObject],
        visible: true,
      }));
    });
    expect(findControlArrow(
      wrapper, "scene-object-face-size-arrow-4-arrow")
      .props.label).toEqual("180mm");
    unmountRenderer(wrapper);
  });

  it("cancels selected scene object face size arrow dragging", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const xMaxMarker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-1");
    const [markerX, markerY, markerZ] =
      positionArray(xMaxMarker.props.position);
    const event = {
      point: new Vector3(markerX, markerY, markerZ),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: {
        clientY: 100,
        stopImmediatePropagation: jest.fn(),
      },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
      ray: new Ray(
        new Vector3(markerX, markerY, markerZ + 100),
        new Vector3(0, 0, -1),
      ),
    };

    act(() => {
      const arrow = wrapper.root.findAll(node =>
        node.type == "group" as ElementType &&
        node.props.name == "scene-object-face-size-arrow-1")[0];
      arrow.props.onPointerMove(event);
      arrow.props.onPointerUp(event);
      arrow.props.onPointerCancel(event);
      arrow.props.onPointerDown(event);
    });
    act(() => {
      const arrow = wrapper.root.findAll(node =>
        node.type == "group" as ElementType &&
        node.props.name == "scene-object-face-size-arrow-1")[0];
      arrow.props.onPointerMove(event);
      arrow.props.onPointerCancel(event);
    });
    act(() => {
      const arrow = wrapper.root.findAll(node =>
        node.type == "group" as ElementType &&
        node.props.name == "scene-object-face-size-arrow-1")[0];
      arrow.props.onPointerDown(event);
      arrow.props.onLostPointerCapture(event);
    });
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.nativeEvent.stopImmediatePropagation).toHaveBeenCalled();
    unmountRenderer(wrapper);
  });

  it("drags the selected scene object base x axis arrow", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const dispatch = jest.fn();
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      dispatch,
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const basePoint = sceneObjectPoint(config, {
      x: sceneObject.body.x_center,
      y: sceneObject.body.y_center,
      z: sceneObject.body.z_base,
    });
    const targetPoint = sceneObjectPoint(config, {
      x: 100,
      y: sceneObject.body.y_center,
      z: sceneObject.body.z_base,
    });
    const event = (point: number[]) => ({
      point: new Vector3(point[0], point[1], point[2]),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
      ray: new Ray(
        new Vector3(point[0], point[1], point[2] + 100),
        new Vector3(0, 0, -1),
      ),
    });

    act(() => {
      findControlHandle(wrapper, "scene-object-base-x-axis-arrow")
        .props.onPointerDown(event(basePoint));
    });
    act(() => {
      const arrow = findControlHandle(
        wrapper, "scene-object-base-x-axis-arrow");
      arrow.props.onPointerMove(event(targetPoint));
      arrow.props.onPointerUp(event(targetPoint));
    });

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "EDIT_RESOURCE",
      payload: expect.objectContaining({
        update: { x_center: 100 },
      }),
    }));
    unmountRenderer(wrapper);
  });

  it("drags the selected scene object base y and z axis arrows", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const dispatch = jest.fn();
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      dispatch,
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const basePoint = sceneObjectPoint(config, {
      x: sceneObject.body.x_center,
      y: sceneObject.body.y_center,
      z: sceneObject.body.z_base,
    });
    const yTargetPoint = sceneObjectPoint(config, {
      x: sceneObject.body.x_center,
      y: 125,
      z: sceneObject.body.z_base,
    });
    const zTargetPoint = sceneObjectPoint(config, {
      x: sceneObject.body.x_center,
      y: sceneObject.body.y_center,
      z: sceneObject.body.z_base + 100,
    });
    const event = (point: number[], clientY = 200) => ({
      point: new Vector3(point[0], point[1], point[2]),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: {
        clientY,
        stopImmediatePropagation: jest.fn(),
      },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
      ray: new Ray(
        new Vector3(point[0], point[1], point[2] + 100),
        new Vector3(0, 0, -1),
      ),
    });

    act(() => {
      findControlHandle(wrapper, "scene-object-base-y-axis-arrow")
        .props.onPointerDown(event(basePoint));
    });
    act(() => {
      const arrow = findControlHandle(
        wrapper, "scene-object-base-y-axis-arrow");
      arrow.props.onPointerMove(event(yTargetPoint));
      arrow.props.onPointerUp(event(yTargetPoint));
    });
    act(() => {
      findControlHandle(wrapper, "scene-object-base-z-axis-arrow")
        .props.onPointerDown(event(basePoint, 200));
    });
    act(() => {
      const arrow = findControlHandle(
        wrapper, "scene-object-base-z-axis-arrow");
      arrow.props.onPointerMove(event(zTargetPoint));
      arrow.props.onPointerUp(event(zTargetPoint));
    });

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "EDIT_RESOURCE",
      payload: expect.objectContaining({
        update: { y_center: 130 },
      }),
    }));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "EDIT_RESOURCE",
      payload: expect.objectContaining({
        update: { z_base: sceneObject.body.z_base + 100 },
      }),
    }));
    unmountRenderer(wrapper);
  });

  it("handles base axis hover, cancel, and lost capture", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const dispatch = jest.fn();
    const config = clone(INITIAL);
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config,
      activeFocus: "",
      dispatch,
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const point = sceneObjectPoint(config, {
      x: sceneObject.body.x_center,
      y: sceneObject.body.y_center,
      z: sceneObject.body.z_base,
    });
    const event = {
      point: new Vector3(point[0], point[1], point[2]),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: {
        clientY: 200,
        stopImmediatePropagation: jest.fn(),
      },
      target: { setPointerCapture: jest.fn() },
      ray: new Ray(
        new Vector3(point[0], point[1], point[2] + 100),
        new Vector3(0, 0, -1),
      ),
    };

    act(() => {
      const arrow = findControlHandle(
        wrapper, "scene-object-base-x-axis-arrow");
      arrow.props.onPointerOver(event);
    });
    expect(wrapper.root.findByProps({
      name: "scene-object-x-origin-arrow-label",
    })).toBeTruthy();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_FOCUSED_SCENE_OBJECT_FIELD,
      payload: "x_center",
    });
    act(() => {
      const arrow = findControlHandle(
        wrapper, "scene-object-base-x-axis-arrow");
      arrow.props.onPointerDown(event);
    });
    dispatch.mockClear();
    act(() => {
      findControlHandle(wrapper, "scene-object-base-x-axis-arrow")
        .props.onPointerOut(event);
      expect(dispatch).not.toHaveBeenCalledWith({
        type: Actions.SET_FOCUSED_SCENE_OBJECT_FIELD,
        payload: undefined,
      });
    });
    act(() => {
      findControlHandle(wrapper, "scene-object-base-x-axis-arrow")
        .props.onPointerCancel(event);
    });
    act(() => {
      const arrow = findControlHandle(
        wrapper, "scene-object-base-x-axis-arrow");
      arrow.props.onPointerOut(event);
      arrow.props.onPointerMove(event);
      arrow.props.onPointerUp(event);
      arrow.props.onPointerCancel(event);
      arrow.props.onLostPointerCapture(event);
      arrow.props.onPointerDown(event);
    });
    act(() => {
      findControlHandle(wrapper, "scene-object-base-x-axis-arrow")
        .props.onPointerCancel(event);
    });
    act(() => {
      findControlHandle(wrapper, "scene-object-base-x-axis-arrow")
        .props.onPointerDown(event);
    });
    act(() => {
      findControlHandle(wrapper, "scene-object-base-x-axis-arrow")
        .props.onLostPointerCapture(event);
    });

    expect(event.stopPropagation).toHaveBeenCalled();
    unmountRenderer(wrapper);
  });

  it("cancels selected scene object marker dragging from window events", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const marker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-0");
    const event = {
      point: new Vector3(0, 0, 0),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: { setPointerCapture: jest.fn() },
    };

    act(() => {
      marker.props.onPointerDown(event);
    });
    act(() => {
      window.dispatchEvent(new Event("pointercancel"));
    });

    expect(event.stopPropagation).toHaveBeenCalled();
    unmountRenderer(wrapper);
  });

  it("ignores selected scene object marker events when not dragging", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const marker = findSelectionMarker(
      wrapper, "scene-object-selection-marker-0");
    const event = {
      point: new Vector3(0, 0, 0),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: { releasePointerCapture: jest.fn() },
      ray: new Ray(new Vector3(0, 0, 100), new Vector3(1, 1, -1)),
    };
    const downEvent = {
      ...event,
      target: { setPointerCapture: jest.fn() },
    };

    act(() => {
      marker.props.onPointerUp(event);
      marker.props.onPointerCancel(event);
      marker.props.onLostPointerCapture(event);
      marker.props.onPointerDown(downEvent);
      marker.props.onPointerUp(event);
    });

    expect(event.stopPropagation).toHaveBeenCalled();
    unmountRenderer(wrapper);
  });

  it("ignores selected scene object move handle events when not dragging", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      sceneObjects: [sceneObject],
      visible: true,
    }));
    const moveHandle = findControlHandle(
      wrapper, "scene-object-move-handle");
    const event = {
      point: new Vector3(0, 0, 0),
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: { releasePointerCapture: jest.fn() },
      ray: new Ray(new Vector3(0, 0, 100), new Vector3(1, 1, -1)),
    };

    act(() => {
      moveHandle.props.onPointerMove(event);
      moveHandle.props.onPointerUp(event);
      moveHandle.props.onPointerDown({
        ...event,
        target: { setPointerCapture: jest.fn() },
      });
      moveHandle.props.onPointerUp(event);
    });

    expect(event.stopPropagation).toHaveBeenCalled();
    unmountRenderer(wrapper);
  });

  it("ignores placement events when disabled", () => {
    const dispatch = jest.fn();
    const { result } = renderHook(() => useTestSceneObjectPlacement({
      config: clone(INITIAL),
      enabled: false,
      dispatch,
      drawnSceneObject: fakeSceneObject().body,
    }));

    act(() => {
      result.current.onPointerMove({
        point: new Vector3(0, 0, 0),
      } as never);
      result.current.onClick({
        stopPropagation: jest.fn(),
      } as never);
    });

    expect(result.current.preview).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("ignores placement clicks caused by orbit control movement", () => {
    const dispatch = jest.fn();
    const event = {
      point: new Vector3(100, 200, 0),
      delta: 10,
      nativeEvent: { clientY: 100 },
      stopPropagation: jest.fn(),
      ray: new Ray(
        new Vector3(100, 200, 100),
        new Vector3(0, 0, -1),
      ),
    };
    const { result } = renderHook(() => useTestSceneObjectPlacement({
      config: clone(INITIAL),
      enabled: true,
      dispatch,
      drawnSceneObject: fakeSceneObject().body,
    }));

    act(() => result.current.onPointerMove(event as never));
    act(() => result.current.onClick(event as never));

    expect(dispatch).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
  });

  it("shows the prefilled object at low opacity until footprint placement", () => {
    const drawnSceneObject: SceneObjectFormValues = {
      ...fakeSceneObject({
        name: "Potted Plant",
        shape: "plant",
        x_size: 500,
        y_size: 600,
        z_size: 700,
      }).body,
      preserve_axes: [],
    };
    const event = {
      point: new Vector3(100, 200, 0),
      nativeEvent: { clientY: 100 },
      stopPropagation: jest.fn(),
      ray: new Ray(
        new Vector3(100, 200, 100),
        new Vector3(0, 0, -1),
      ),
    };
    const { result } = renderHook(() => useTestSceneObjectPlacement({
      config: clone(INITIAL),
      enabled: true,
      dispatch: jest.fn(),
      drawnSceneObject,
    }));

    act(() => result.current.onPointerMove(event as never));
    let wrapper = createRenderer(
      result.current.preview as React.ReactElement);
    let preview = wrapper.root.findByType(SceneObjectPreview);
    expect(preview.props.opacity).toEqual(0.5);
    expect(preview.props.sceneObject).toEqual(expect.objectContaining({
      name: "Potted Plant",
      shape: "plant",
      x_size: 500,
      y_size: 600,
      z_size: 700,
    }));
    unmountRenderer(wrapper);

    act(() => result.current.onClick(event as never));
    act(() => result.current.onPointerMove({
      ...event,
      point: new Vector3(200, 300, 0),
    } as never));
    act(() => result.current.onClick(event as never));
    wrapper = createRenderer(result.current.preview as React.ReactElement);
    const previews = wrapper.root.findAllByType(SceneObjectPreview);
    expect(previews).toHaveLength(2);
    expect(previews.map(item => item.props.opacity)).toEqual([
      0.5,
      undefined,
    ]);
    unmountRenderer(wrapper);

    act(() => result.current.onPointerMove({
      ...event,
      point: new Vector3(200, 300, 0),
    } as never));
    act(() => result.current.onClick(event as never));
    wrapper = createRenderer(result.current.preview as React.ReactElement);
    preview = wrapper.root.findByType(SceneObjectPreview);
    expect(preview.props.opacity).toBeUndefined();
    unmountRenderer(wrapper);
  });

  it("skips the ghost and rotation phase for custom objects", () => {
    const config = clone(INITIAL);
    const drawnSceneObject = fakeSceneObject({ rotation: 30 }).body;
    const get3DPosition = get3DPositionFunc(config);
    const event = (gardenPosition: { x: number, y: number }) => {
      const point = get3DPosition(gardenPosition);
      return {
        point: new Vector3(point.x, point.y, 0),
        nativeEvent: { clientY: 100 },
        stopPropagation: jest.fn(),
        ray: new Ray(
          new Vector3(point.x, point.y, 100),
          new Vector3(0, 0, -1),
        ),
      };
    };
    const { result } = renderHook(() => useTestSceneObjectPlacement({
      config,
      enabled: true,
      dispatch: jest.fn(),
      drawnSceneObject,
    }));

    act(() => result.current.onPointerMove(
      event({ x: 100, y: 200 }) as never));
    let wrapper = createRenderer(
      result.current.preview as React.ReactElement);
    expect(wrapper.root.findAllByType(SceneObjectPreview)).toHaveLength(0);
    unmountRenderer(wrapper);

    act(() => result.current.onClick(
      event({ x: 100, y: 200 }) as never));
    act(() => result.current.onPointerMove(
      event({ x: 140, y: 260 }) as never));
    wrapper = createRenderer(
      result.current.preview as React.ReactElement);
    const preview = wrapper.root.findByType(SceneObjectPreview);
    expect(preview.props.opacity).toBeUndefined();
    expect(preview.props.sceneObject.rotation).toEqual(30);
    expect(preview.props.sceneObject).toEqual(expect.objectContaining({
      x_size: 130,
      y_size: 64,
    }));
    expect(wrapper.root.findAllByProps({
      name: "scene-object-placement-rotation-guide",
    })).toHaveLength(0);
    unmountRenderer(wrapper);
  });

  it("sizes rotated placement previews in local object axes", () => {
    const config = clone(INITIAL);
    const drawnSceneObject: SceneObjectFormValues = {
      ...fakeSceneObject({ rotation: 0 }).body,
      preserve_axes: [],
    };
    const dispatch = jest.fn();
    const get3DPosition = get3DPositionFunc(config);
    const event = (gardenPosition: { x: number, y: number }) => {
      const point = get3DPosition(gardenPosition);
      return {
        point: new Vector3(point.x, point.y, 0),
        nativeEvent: { clientY: 100 },
        stopPropagation: jest.fn(),
        ray: new Ray(
          new Vector3(point.x, point.y, 100),
          new Vector3(0, 0, -1),
        ),
      };
    };
    const { result } = renderHook(() => useTestSceneObjectPlacement({
      config,
      enabled: true,
      dispatch,
      drawnSceneObject,
    }));

    act(() => result.current.onPointerMove(
      event({ x: 100, y: 200 }) as never));
    act(() => result.current.onClick(
      event({ x: 100, y: 200 }) as never));
    act(() => result.current.onPointerMove(
      event({ x: 100, y: 300 }) as never));
    const rotationWrapper = createRenderer(
      result.current.preview as React.ReactElement);
    const rotationPreview = rotationWrapper.root
      .findAllByType(SceneObjectPreview)
      .find(item => item.props.opacity === undefined);
    expect(rotationPreview?.props.sceneObject.rotation).toEqual(90);
    const guide = rotationWrapper.root.findByProps({
      name: "scene-object-placement-rotation-guide",
    });
    expect(guide.props.color).toEqual("orange");
    expect(guide.props.points[0][0])
      .toBeCloseTo(guide.props.points[1][0] as number);
    expect(Math.abs(guide.props.points[1][1] - guide.props.points[0][1]))
      .toBeGreaterThan(drawnSceneObject.y_size);
    unmountRenderer(rotationWrapper);
    act(() => result.current.onClick(
      event({ x: 100, y: 300 }) as never));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "SET_DRAWN_SCENE_OBJECT_DATA",
      payload: expect.objectContaining({ rotation: 90 }),
    }));
    act(() => result.current.onPointerMove(
      event({ x: 140, y: 260 }) as never));

    const wrapper = createRenderer(
      result.current.preview as React.ReactElement);
    const preview = wrapper.root.findAllByType(SceneObjectPreview)
      .find(item => item.props.opacity === undefined);
    expect(preview?.props.sceneObject).toEqual(expect.objectContaining({
      rotation: 90,
      x_size: 120,
      y_size: 80,
    }));
    expect(wrapper.root.findAllByProps({
      name: "scene-object-placement-rotation-guide",
    })).toHaveLength(0);
    unmountRenderer(wrapper);
  });

  it("handles placement preview without drawn scene object data", () => {
    const config = clone(INITIAL);
    const event = {
      point: new Vector3(0, 0, 0),
      nativeEvent: { clientY: 100 },
      stopPropagation: jest.fn(),
      ray: new Ray(
        new Vector3(0, 0, 100),
        new Vector3(0, 0, -1),
      ),
    };
    const { result, rerender } = renderHook(
      ({ drawnSceneObject }) => useTestSceneObjectPlacement({
        config,
        enabled: true,
        dispatch: jest.fn(),
        drawnSceneObject,
      }),
      { initialProps: { drawnSceneObject: fakeSceneObject().body } },
    );

    act(() => {
      result.current.onPointerMove(event as never);
    });
    act(() => {
      result.current.onClick(event as never);
    });
    rerender({ drawnSceneObject: undefined as never });
    act(() => {
      result.current.onPointerMove({
        ...event,
        point: new Vector3(50, 50, 0),
      } as never);
    });

    const wrapper = createRenderer(result.current.preview as React.ReactElement);
    expect(wrapper.root.findByProps({
      name: "scene-object-placement-preview",
    })).toBeTruthy();
    unmountRenderer(wrapper);
  });

  it("renders scene objects without provided scene object list", () => {
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      visible: true,
    }));

    expect(wrapper.root).toBeTruthy();
    unmountRenderer(wrapper);
  });

  it("renders hover edges for non-selected scene objects", () => {
    location.pathname = Path.mock(Path.sceneObjects());
    const sceneObject = fakeSceneObject({ texture: "none" });
    sceneObject.body.id = 1;
    const wrapper = createRenderer(React.createElement(SceneObjects, {
      config: clone(INITIAL),
      activeFocus: "",
      sceneObjects: [sceneObject],
      hoverSelection: { kind: "sceneObject", id: 1 },
      visible: true,
    }));

    expect(wrapper.root.findAllByProps({ className: "edges" }).length)
      .toBeGreaterThan(0);
    unmountRenderer(wrapper);
  });

  it("handles placement events without dispatch", () => {
    const event = (point: Vector3, clientY: number) => ({
      point,
      nativeEvent: { clientY },
      stopPropagation: jest.fn(),
      ray: new Ray(
        new Vector3(point.x, point.y, 100),
        new Vector3(0, 0, -1),
      ),
    });
    const { result } = renderHook(() => useTestSceneObjectPlacement({
      config: clone(INITIAL),
      enabled: true,
      drawnSceneObject: fakeSceneObject().body,
    }));

    act(() => {
      result.current.onPointerMove(event(new Vector3(0, 0, 0), 100) as never);
    });
    act(() => {
      result.current.onClick(event(new Vector3(0, 0, 0), 100) as never);
    });
    act(() => {
      result.current.onPointerMove(event(new Vector3(50, 50, 0), 80) as never);
    });
    act(() => {
      result.current.onClick(event(new Vector3(50, 50, 0), 80) as never);
    });
    act(() =>
      result.current.onPointerMove(
        event(new Vector3(50, 50, 100), 50) as never));
    act(() =>
      result.current.onClick(event(new Vector3(50, 50, 100), 50) as never));

    expect(result.current.preview).toBeUndefined();
  });

  it("renders placement preview defaults with incomplete scene object data", () => {
    const drawnSceneObject = {
      ...fakeSceneObject().body,
      name: "",
      texture: undefined,
      shape: undefined,
      color: undefined,
      z_base: undefined,
      x_size: undefined,
      y_size: undefined,
      x_origin: undefined,
      y_origin: undefined,
    };
    const { result } = renderHook(() => useTestSceneObjectPlacement({
      config: clone(INITIAL),
      enabled: true,
      dispatch: jest.fn(),
      drawnSceneObject: drawnSceneObject as never,
    }));
    const event = {
      point: new Vector3(0, 0, 0),
      nativeEvent: { clientY: 100 },
      stopPropagation: jest.fn(),
    };

    act(() => {
      result.current.onPointerMove(event as never);
    });
    act(() => {
      result.current.onClick(event as never);
    });
    act(() => {
      result.current.onPointerMove({
        ...event,
        point: new Vector3(50, 50, 0),
      } as never);
    });

    const wrapper = createRenderer(result.current.preview as React.ReactElement);
    expect(wrapper.root).toBeTruthy();
    unmountRenderer(wrapper);
  });

  it("places and saves a scene object", async () => {
    const dispatch = jest.fn(() => Promise.resolve());
    const body = fakeSceneObject({ name: "" }).body;
    const event = (point: Vector3, clientY: number) => ({
      point,
      nativeEvent: { clientY },
      stopPropagation: jest.fn(),
      ray: new Ray(
        new Vector3(point.x, point.y, 100),
        new Vector3(0, 0, -1),
      ),
    });
    const { result } = renderHook(() => useTestSceneObjectPlacement({
      config: clone(INITIAL),
      enabled: true,
      dispatch,
      sceneObjects: [fakeSceneObject()],
      drawnSceneObject: body,
    }));

    act(() => {
      result.current.onPointerMove(event(new Vector3(0, 0, 0), 100) as never);
    });
    expect(result.current.preview).toBeTruthy();

    act(() => {
      result.current.onClick(event(new Vector3(0, 0, 0), 100) as never);
    });
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "SET_DRAWN_SCENE_OBJECT_DATA",
    }));

    act(() =>
      result.current.onPointerMove(event(new Vector3(50, 50, 0), 80) as never));
    act(() =>
      result.current.onClick(event(new Vector3(50, 50, 0), 80) as never));

    await act(async () => {
      result.current.onPointerMove(event(new Vector3(50, 50, 100), 50) as never);
      await Promise.resolve();
    });
    await act(async () => {
      result.current.onClick(event(new Vector3(50, 50, 100), 50) as never);
      await Promise.resolve();
    });

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "INIT_RESOURCE",
    }));
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("places scene objects with non-home origins", async () => {
    const dispatch = jest.fn(() => Promise.resolve());
    const config = clone(INITIAL);
    const body = fakeSceneObject({
      x_origin: "max",
      y_origin: "world",
      z_origin: "max",
    }).body;
    const event = (point: Vector3, clientY: number) => ({
      point,
      nativeEvent: { clientY },
      stopPropagation: jest.fn(),
      ray: new Ray(
        new Vector3(point.x, point.y, 100),
        new Vector3(0, 0, -1),
      ),
    });
    const { result } = renderHook(() => useTestSceneObjectPlacement({
      config,
      enabled: true,
      dispatch,
      drawnSceneObject: body,
    }));

    act(() => {
      result.current.onPointerMove(event(new Vector3(0, 0, 0), 100) as never);
    });
    act(() => {
      result.current.onClick(event(new Vector3(0, 0, 0), 100) as never);
    });
    act(() => {
      result.current.onPointerMove(event(new Vector3(50, 50, 0), 80) as never);
    });
    act(() => {
      result.current.onClick(event(new Vector3(50, 50, 0), 80) as never);
    });

    await act(async () => {
      result.current.onPointerMove(event(new Vector3(50, 50, 100), 50) as never);
      await Promise.resolve();
    });
    await act(async () => {
      result.current.onClick(event(new Vector3(50, 50, 100), 50) as never);
      await Promise.resolve();
    });

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "INIT_RESOURCE",
      payload: expect.objectContaining({
        body: expect.objectContaining({
          z_base: 0,
        }),
      }),
    }));
  });

  it("uses latest form values when placing scene objects", () => {
    const dispatch = jest.fn(() => Promise.resolve());
    const config = clone(INITIAL);
    const initialBody = fakeSceneObject().body;
    const updatedBody = {
      ...initialBody,
      x_origin: "max",
      y_origin: "world",
      z_origin: "max",
    };
    const event = {
      point: new Vector3(0, 0, 0),
      nativeEvent: { clientY: 100 },
      stopPropagation: jest.fn(),
      ray: new Ray(
        new Vector3(0, 0, 100),
        new Vector3(0, 0, -1),
      ),
    };
    const { result, rerender } = renderHook(
      ({ drawnSceneObject }) => useTestSceneObjectPlacement({
        config,
        enabled: true,
        dispatch,
        drawnSceneObject,
      }),
      { initialProps: { drawnSceneObject: initialBody } },
    );

    act(() => {
      result.current.onPointerMove(event as never);
    });
    const staleClick = result.current.onClick;
    rerender({ drawnSceneObject: updatedBody });
    act(() => {
      staleClick(event as never);
    });

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "SET_DRAWN_SCENE_OBJECT_DATA",
      payload: expect.objectContaining({
        x_origin: "max",
        y_origin: "world",
        z_origin: "max",
        z_base: 0,
      }),
    }));
  });

  it("starts new scene objects from the home origin plane", () => {
    const dispatch = jest.fn(() => Promise.resolve());
    const config = clone(INITIAL);
    const body = fakeSceneObject({ z_origin: "home" }).body;
    const event = {
      point: new Vector3(0, 0, 0),
      nativeEvent: { clientY: 100 },
      stopPropagation: jest.fn(),
      ray: new Ray(
        new Vector3(0, 0, 100),
        new Vector3(0, 0, -1),
      ),
    };
    const { result } = renderHook(() => useTestSceneObjectPlacement({
      config,
      enabled: true,
      dispatch,
      drawnSceneObject: body,
    }));

    act(() => result.current.onPointerMove(event as never));
    act(() => result.current.onClick(event as never));

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "SET_DRAWN_SCENE_OBJECT_DATA",
      payload: expect.objectContaining({
        z_origin: "home",
        z_base: 0,
      }),
    }));
  });

  it("previews new scene objects from the selected home origin plane", () => {
    const config = clone(INITIAL);
    const body = fakeSceneObject({ z_origin: "home" }).body;
    const event = {
      point: new Vector3(0, 0, 0),
      nativeEvent: { clientY: 100 },
      stopPropagation: jest.fn(),
    };
    const { result } = renderHook(() => useTestSceneObjectPlacement({
      config,
      enabled: true,
      dispatch: jest.fn(),
      drawnSceneObject: body,
    }));

    act(() => {
      result.current.onPointerMove(event as never);
    });

    const wrapper = createRenderer(result.current.preview as React.ReactElement);
    const preview = wrapper.root.findByProps({
      name: "scene-object-placement-preview",
    });

    const plane = preview.findByProps({ name: "scene-object-origin-plane" });
    expect(plane.props.args).toEqual([
      BigDistance.ground * 2,
      BigDistance.ground * 2,
      2,
    ]);
    expect(plane.props.position[2]).toEqual(zZero(config));
    expect(preview.findAllByType(Sphere)[0].props.position[2])
      .toEqual(zZero(config) + 25);
    unmountRenderer(wrapper);
  });

  it("doesn't show the origin plane for world origin scene objects", () => {
    const config = clone(INITIAL);
    const body = fakeSceneObject({ z_origin: "world" }).body;
    const { result } = renderHook(() => useTestSceneObjectPlacement({
      config,
      enabled: true,
      dispatch: jest.fn(),
      drawnSceneObject: body,
    }));

    act(() => {
      result.current.onPointerMove({
        point: new Vector3(0, 0, 0),
        nativeEvent: { clientY: 100 },
        stopPropagation: jest.fn(),
      } as never);
    });

    const wrapper = createRenderer(result.current.preview as React.ReactElement);

    expect(wrapper.root.findAllByProps({
      name: "scene-object-origin-plane",
    })).toEqual([]);
    unmountRenderer(wrapper);
  });

  it("projects new scene object cursor onto the selected home origin plane", () => {
    const config = clone(INITIAL);
    const body = fakeSceneObject({ z_origin: "home" }).body;
    const { result } = renderHook(() => useTestSceneObjectPlacement({
      config,
      enabled: true,
      dispatch: jest.fn(),
      drawnSceneObject: body,
    }));

    act(() => {
      result.current.onPointerMove({
        point: new Vector3(0, 0, 0),
        nativeEvent: { clientY: 100 },
        stopPropagation: jest.fn(),
        ray: new Ray(
          new Vector3(0, 0, zZero(config) + 100),
          new Vector3(0, 0, -1),
        ),
      } as never);
    });

    const wrapper = createRenderer(result.current.preview as React.ReactElement);
    const preview = wrapper.root.findByProps({
      name: "scene-object-placement-preview",
    });

    expect(preview.findAllByType(Sphere)[0].props.position)
      .toEqual([0, 0, zZero(config) + 25]);
    unmountRenderer(wrapper);
  });

  it("sizes new scene objects up from the selected home origin plane", async () => {
    const dispatch = jest.fn(() => Promise.resolve());
    const config = clone(INITIAL);
    const body = fakeSceneObject({ z_origin: "home" }).body;
    const event = (point: Vector3, clientY: number) => ({
      point,
      nativeEvent: { clientY },
      stopPropagation: jest.fn(),
      ray: new Ray(
        new Vector3(point.x, point.y, 100),
        new Vector3(0, 0, -1),
      ),
    });
    const { result } = renderHook(() => useTestSceneObjectPlacement({
      config,
      enabled: true,
      dispatch,
      drawnSceneObject: body,
    }));

    act(() =>
      result.current.onPointerMove(event(new Vector3(0, 0, 0), 100) as never));
    act(() =>
      result.current.onClick(event(new Vector3(0, 0, 0), 100) as never));
    act(() =>
      result.current.onPointerMove(event(new Vector3(50, 50, 0), 90) as never));
    act(() =>
      result.current.onClick(event(new Vector3(50, 50, 0), 90) as never));
    await act(async () => {
      result.current.onPointerMove(event(new Vector3(50, 50, 0), 50) as never);
      await Promise.resolve();
    });
    await act(async () => {
      result.current.onClick(event(new Vector3(50, 50, 0), 50) as never);
      await Promise.resolve();
    });

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "INIT_RESOURCE",
      payload: expect.objectContaining({
        body: expect.objectContaining({
          z_origin: "home",
          z_base: 0,
          z_size: 80,
        }),
      }),
    }));
  });

  it("keeps the origin plane fixed while sizing scene object height", () => {
    const config = clone(INITIAL);
    const body = fakeSceneObject({ z_origin: "home" }).body;
    const event = (point: Vector3, clientY: number) => ({
      point,
      nativeEvent: { clientY },
      stopPropagation: jest.fn(),
      ray: new Ray(
        new Vector3(point.x, point.y, 100),
        new Vector3(0, 0, -1),
      ),
    });
    const { result } = renderHook(() => useTestSceneObjectPlacement({
      config,
      enabled: true,
      dispatch: jest.fn(),
      drawnSceneObject: body,
    }));

    act(() =>
      result.current.onPointerMove(
        event(new Vector3(0, 0, 0), 100) as never));
    act(() =>
      result.current.onClick(
        event(new Vector3(0, 0, 0), 100) as never));
    act(() =>
      result.current.onPointerMove(
        event(new Vector3(50, 50, 0), 90) as never));
    act(() =>
      result.current.onClick(
        event(new Vector3(50, 50, 0), 90) as never));
    act(() =>
      result.current.onPointerMove(
        event(new Vector3(50, 50, 0), 50) as never));

    const wrapper = createRenderer(result.current.preview as React.ReactElement);
    const plane = wrapper.root.findByProps({ name: "scene-object-origin-plane" });

    expect(plane.props.position[2]).toEqual(zZero(config));
    unmountRenderer(wrapper);
  });

  it("renders placement previews for custom scene object shapes", () => {
    [
      "plant", "tray", "window", "laptop", "desk", "solar", "tree",
      "fence", "astronaut", "hab", "rover", "box",
    ]
      .forEach(shape => {
        const { result } = renderHook(() => useTestSceneObjectPlacement({
          config: clone(INITIAL),
          enabled: true,
          dispatch: jest.fn(),
          drawnSceneObject: fakeSceneObject({ shape }).body,
        }));
        const event = {
          point: new Vector3(0, 0, 0),
          nativeEvent: { clientY: 100 },
          stopPropagation: jest.fn(),
        };

        act(() => {
          result.current.onPointerMove(event as never);
        });
        act(() => {
          result.current.onClick(event as never);
        });
        act(() => {
          result.current.onPointerMove({
            ...event,
            point: new Vector3(50, 50, 0),
          } as never);
        });

        const wrapper = createRenderer(
          result.current.preview as React.ReactElement);
        expect(wrapper.root).toBeTruthy();
        unmountRenderer(wrapper);
      });
  });
});
