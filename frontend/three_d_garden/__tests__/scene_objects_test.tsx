import React, { ElementType } from "react";
import { act, renderHook } from "@testing-library/react";
import { Cone, Cylinder, Sphere } from "@react-three/drei";
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
} from "../scene_objects";
import { clone } from "lodash";
import { INITIAL } from "../config";
import { BigDistance } from "../constants";
import { zZero } from "../helpers";
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

const findControlHandle = (
  wrapper: ReturnType<typeof createRenderer>,
  name: string,
) => wrapper.root.find(node =>
  node.type == "group" as ElementType &&
  node.props.name == name &&
  typeof node.props.onPointerDown == "function");

const findControlArrow = (
  wrapper: ReturnType<typeof createRenderer>,
  name: string,
) => wrapper.root.find(node =>
  node.props.name == name &&
  Array.isArray(node.props.start) &&
  Array.isArray(node.props.end));

describe("scene object placement helpers", () => {
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
    { axes: ["z"], clicks: 2 },
    { axes: ["x", "y"], clicks: 2 },
    { axes: ["x", "y", "z"], clicks: 1 },
  ] as { axes: ("x" | "y" | "z")[], clicks: number }[])(
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
      wrapper, "scene-object-face-size-arrow-0").findAllByProps({
      name: "scene-object-face-size-arrow-0-label",
    }).length).toBeGreaterThan(0);
    expect(findControlHandle(
      wrapper, "scene-object-face-size-arrow-1").findAllByProps({
      name: "scene-object-face-size-arrow-1-label",
    }).length).toBeGreaterThan(0);
    expect(findControlHandle(
      wrapper, "scene-object-face-size-arrow-2").findByProps({
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

  it("uses fixed world sizing for selected scene object controls", () => {
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

  it("shows the prefilled object at low opacity until the second click", () => {
    const drawnSceneObject = fakeSceneObject({
      name: "Potted Plant",
      shape: "plant",
      x_size: 500,
      y_size: 600,
      z_size: 700,
    }).body;
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
      result.current.onPointerMove(event(new Vector3(50, 50, 0), 90) as never);
    });
    act(() => {
      result.current.onClick(event(new Vector3(50, 50, 0), 90) as never);
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
      result.current.onPointerMove(event(new Vector3(50, 50, 0), 90) as never));
    act(() =>
      result.current.onClick(event(new Vector3(50, 50, 0), 90) as never));

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
      result.current.onPointerMove(event(new Vector3(50, 50, 0), 90) as never);
    });
    act(() => {
      result.current.onClick(event(new Vector3(50, 50, 0), 90) as never);
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

    act(() => {
      result.current.onPointerMove(event(new Vector3(0, 0, 0), 100) as never);
      result.current.onClick(event(new Vector3(0, 0, 0), 100) as never);
      result.current.onPointerMove(event(new Vector3(50, 50, 0), 90) as never);
      result.current.onClick(event(new Vector3(50, 50, 0), 90) as never);
      result.current.onPointerMove(event(new Vector3(50, 50, 0), 50) as never);
    });

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
