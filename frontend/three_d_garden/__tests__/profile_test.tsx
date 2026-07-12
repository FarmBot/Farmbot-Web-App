import {
  Group, Mesh, MeshBasicMaterial, Plane, Vector3,
} from "three";
import {
  createProfileClippingBinding,
  getProfileClippingPlanes, getProfileOutsidePlaneConstants,
  PROFILE_CLIPPING_EXEMPT,
  PROFILE_FAR_CLIPPING_EXEMPT, useAnimatedProfilePlanes, useProfileClipping,
} from "../profile";
import React from "react";
import { render, waitFor } from "@testing-library/react";
import * as reactSpring from "@react-spring/three";

describe("getProfileClippingPlanes()", () => {
  const config = {
    bedLengthOuter: 1000,
    bedWidthOuter: 600,
    bedXOffset: 0,
    bedYOffset: 0,
    mirrorX: false,
    mirrorY: false,
  };

  it("keeps the selected X slice", () => {
    const planes = getProfileClippingPlanes(config, "x", 100, 200);
    expect(planes[0].distanceToPoint(new Vector3(-400, 0, 0)))
      .toEqual(100);
    expect(planes[1].distanceToPoint(new Vector3(-400, 0, 0)))
      .toEqual(100);
    expect(planes[1].distanceToPoint(new Vector3(-200, 0, 0)))
      .toBeLessThan(0);
    expect(planes[0].distanceToPoint(new Vector3(-600, 0, 0)))
      .toBeLessThan(0);
  });

  it("supports Y slices and mirrored coordinates", () => {
    const planes = getProfileClippingPlanes(
      { ...config, mirrorY: true }, "y", 100, 200);
    expect(planes[0].distanceToPoint(new Vector3(0, 200, 0)))
      .toEqual(100);
    expect(planes[1].distanceToPoint(new Vector3(0, 200, 0)))
      .toEqual(100);
    expect(planes[0].distanceToPoint(new Vector3(0, 0, 0)))
      .toBeLessThan(0);
    expect(planes[1].distanceToPoint(new Vector3(0, 400, 0)))
      .toBeLessThan(0);
  });

  it("places resting planes just outside each garden axis", () => {
    expect(getProfileOutsidePlaneConstants({
      bedLengthOuter: config.bedLengthOuter,
      bedWidthOuter: config.bedWidthOuter,
    })).toEqual({ x: 1500, y: 1300 });
  });
});

describe("useAnimatedProfilePlanes()", () => {
  it("springs planes in, out, and across axes", async () => {
    const stop = jest.fn();
    const start = jest.fn((props: {
      first?: number;
      second?: number;
      immediate?: boolean;
      onChange?(result: { value: object }): void;
      onRest?(): void;
    }) => {
      props.onChange?.({ value: {
        first: props.first,
        second: props.second,
      } });
      props.onRest?.();
    });
    const api = { start, stop };
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation((() => [{}, api]) as never);
    const planes = getProfileClippingPlanes({
      bedLengthOuter: 1000,
      bedWidthOuter: 600,
      bedXOffset: 0,
      bedYOffset: 0,
      mirrorX: false,
      mirrorY: false,
    }, "x", 100, 200);
    const Probe = (props: { enabled: boolean; axis: "x" | "y" }) => {
      const animated = useAnimatedProfilePlanes(
        props.enabled,
        props.axis,
        planes,
      );
      return <div data-mounted={animated.mounted}
        data-axis={animated.axis}
        data-constant={animated.planes[0].constant} />;
    };
    const { rerender, container, unmount } = render(
      <Probe enabled={false} axis={"x"} />,
    );
    await waitFor(() => expect(container.firstChild)
      .toHaveAttribute("data-mounted", "false"));
    rerender(<Probe enabled={true} axis={"x"} />);
    await waitFor(() => expect(container.firstChild)
      .toHaveAttribute("data-mounted", "true"));
    rerender(<Probe enabled={true} axis={"y"} />);
    await waitFor(() => expect(container.firstChild)
      .toHaveAttribute("data-axis", "y"));
    unmount();
    expect(start).toHaveBeenCalled();
    expect(start.mock.calls.every(([config]) => config.immediate === false))
      .toEqual(true);
    expect(stop).toHaveBeenCalled();
    springSpy.mockRestore();
  });

  it("keeps clipping mounted until the exit spring rests", () => {
    const starts: { onRest?(): void }[] = [];
    const api = {
      start: jest.fn((props: { onRest?(): void }) => starts.push(props)),
      stop: jest.fn(),
    };
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation((() => [{}, api]) as never);
    const planes = [
      new Plane(new Vector3(1, 0, 0), 100),
      new Plane(new Vector3(-1, 0, 0), 100),
    ];
    const Probe = ({ enabled }: { enabled: boolean }) => {
      const animated = useAnimatedProfilePlanes(enabled, "x", planes);
      return <div data-mounted={animated.mounted} />;
    };
    const { container, rerender } = render(<Probe enabled={true} />);
    expect(container.firstChild).toHaveAttribute("data-mounted", "true");
    rerender(<Probe enabled={false} />);
    expect(container.firstChild).toHaveAttribute("data-mounted", "true");
    React.act(() => starts[starts.length - 1]?.onRest?.());
    expect(container.firstChild).toHaveAttribute("data-mounted", "false");
    springSpy.mockRestore();
  });

  it("keeps the old axis until its outward spring rests", () => {
    const starts: {
      first?: number;
      second?: number;
      onRest?(): void;
    }[] = [];
    const api = {
      start: jest.fn((props: typeof starts[number]) => starts.push(props)),
      stop: jest.fn(),
    };
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation((() => [{}, api]) as never);
    const planes = [
      new Plane(new Vector3(1, 0, 0), 100),
      new Plane(new Vector3(-1, 0, 0), 100),
    ];
    const outsidePlaneConstants = { x: 1500, y: 900 };
    const Probe = ({ axis }: { axis: "x" | "y" }) => {
      const animated = useAnimatedProfilePlanes(
        true,
        axis,
        planes,
        false,
        outsidePlaneConstants,
      );
      return <div data-axis={animated.axis} />;
    };
    const { container, rerender } = render(<Probe axis={"x"} />);
    rerender(<Probe axis={"y"} />);

    expect(container.firstChild).toHaveAttribute("data-axis", "x");
    expect(starts[starts.length - 1]).toEqual(expect.objectContaining({
      first: 1500,
      second: 1500,
    }));
    React.act(() => starts[starts.length - 1]?.onRest?.());
    expect(container.firstChild).toHaveAttribute("data-axis", "y");
    springSpy.mockRestore();
  });

  it("springs an off-center followed slice out from its current axis", () => {
    interface SpringStart {
      first?: number;
      second?: number;
      from?: { first: number; second: number };
      onChange?(result: { value: object }): void;
    }
    const starts: SpringStart[] = [];
    const api = {
      start: jest.fn((props: SpringStart) => starts.push(props)),
      stop: jest.fn(),
    };
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation((() => [{}, api]) as never);
    const planesFor = (axis: "x" | "y") => axis == "x"
      ? [
        new Plane(new Vector3(1, 0, 0), -250),
        new Plane(new Vector3(-1, 0, 0), 350),
      ]
      : [
        new Plane(new Vector3(0, 1, 0), 250),
        new Plane(new Vector3(0, -1, 0), -150),
      ];
    const outsidePlaneConstants = { x: 1500, y: 1300 };
    const Probe = ({ axis }: { axis: "x" | "y" }) => {
      const animated = useAnimatedProfilePlanes(
        true,
        axis,
        planesFor(axis),
        true,
        outsidePlaneConstants,
      );
      return <div data-axis={animated.axis}
        data-first={animated.planes[0].constant}
        data-second={animated.planes[1].constant} />;
    };
    const { container, rerender } = render(<Probe axis={"x"} />);
    React.act(() => starts[0].onChange?.({
      value: { first: 50, second: 50 },
    }));
    expect(container.firstChild).toHaveAttribute("data-first", "-250");
    expect(container.firstChild).toHaveAttribute("data-second", "350");

    rerender(<Probe axis={"y"} />);

    expect(container.firstChild).toHaveAttribute("data-axis", "x");
    expect(container.firstChild).toHaveAttribute("data-first", "-250");
    expect(container.firstChild).toHaveAttribute("data-second", "350");
    expect(starts[starts.length - 1].from).toEqual({
      first: -250,
      second: 350,
    });
    springSpy.mockRestore();
  });

  it("springs both followed planes to fixed world-space endpoints", () => {
    interface SpringStart {
      first?: number;
      second?: number;
      from?: { first: number; second: number };
      onChange?(result: { value: object }): void;
      onRest?(): void;
    }
    const starts: SpringStart[] = [];
    const api = {
      start: jest.fn((props: SpringStart) => starts.push(props)),
      stop: jest.fn(),
    };
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation((() => [{}, api]) as never);
    const planes = [
      new Plane(new Vector3(1, 0, 0), -250),
      new Plane(new Vector3(-1, 0, 0), 350),
    ];
    const outsidePlaneConstants = { x: 1500, y: 1300 };
    const Probe = ({ enabled }: { enabled: boolean }) => {
      const animated = useAnimatedProfilePlanes(
        enabled,
        "x",
        planes,
        true,
        outsidePlaneConstants,
      );
      return <div data-mounted={animated.mounted}
        data-first={animated.planes[0].constant}
        data-second={animated.planes[1].constant} />;
    };
    const { container, rerender } = render(<Probe enabled={true} />);
    React.act(() => starts[0].onChange?.({
      value: { first: 50, second: 50 },
    }));
    rerender(<Probe enabled={false} />);
    const exit = starts[starts.length - 1];

    expect(exit.from).toEqual({ first: -250, second: 350 });
    expect(exit.first).toEqual(1500);
    expect(exit.second).toEqual(1500);
    React.act(() => exit.onChange?.({
      value: { first: 1500, second: 1500 },
    }));
    expect(container.firstChild).toHaveAttribute("data-first", "1500");
    expect(container.firstChild).toHaveAttribute("data-second", "1500");
    React.act(() => exit.onRest?.());
    expect(container.firstChild).toHaveAttribute("data-mounted", "false");
    springSpy.mockRestore();
  });

  it("moves followed centers directly without retargeting the spring", () => {
    const api = { start: jest.fn(), stop: jest.fn() };
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation((() => [{}, api]) as never);
    const Probe = ({ center }: { center: number }) => {
      const planes = [
        new Plane(new Vector3(1, 0, 0), -center + 50),
        new Plane(new Vector3(-1, 0, 0), center + 50),
      ];
      const animated = useAnimatedProfilePlanes(true, "x", planes, true);
      const lower = -animated.planes[0].constant;
      const upper = animated.planes[1].constant;
      return <div data-center={(lower + upper) / 2} />;
    };
    const { container, rerender } = render(<Probe center={100} />);
    expect(container.firstChild).toHaveAttribute("data-center", "100");
    const initialSpringCalls = api.start.mock.calls.length;
    rerender(<Probe center={325} />);
    expect(container.firstChild).toHaveAttribute("data-center", "325");
    expect(api.start).toHaveBeenCalledTimes(initialSpringCalls);
    springSpy.mockRestore();
  });
});

describe("createProfileClippingBinding()", () => {
  const planes = [
    new Plane(new Vector3(1, 0, 0), 0),
    new Plane(new Vector3(-1, 0, 0), 100),
  ];

  it("applies, updates, and restores material clipping", () => {
    const root = new Group();
    const existing = new Plane(new Vector3(0, 0, 1), 10);
    const materialA = new MeshBasicMaterial();
    const materialB = new MeshBasicMaterial();
    materialA.clippingPlanes = [existing];
    materialA.clipShadows = false;
    root.add(new Mesh(undefined, [materialA, materialB]));

    const binding = createProfileClippingBinding(root);
    binding.update(planes);

    expect(materialA.clippingPlanes).toEqual([existing, ...planes]);
    expect(materialB.clippingPlanes).toEqual(planes);
    expect(materialA.clipShadows).toEqual(true);
    expect(materialB.clipShadows).toEqual(true);

    binding.restore();
    expect(materialA.clippingPlanes).toEqual([existing]);
    expect(materialB.clippingPlanes).toBeNull();
    expect(materialA.clipShadows).toEqual(false);
  });

  it("does not invalidate unchanged materials during rendering", () => {
    const root = new Group();
    const material = new MeshBasicMaterial();
    const mesh = new Mesh(undefined, material);
    root.add(mesh);
    const binding = createProfileClippingBinding(root);
    binding.update(planes);
    const clippingPlanes = material.clippingPlanes;
    const materialVersion = material.version;
    const renderArgs = [] as unknown as Parameters<
      typeof mesh.onBeforeRender
    >;

    mesh.onBeforeRender(...renderArgs);
    mesh.onBeforeRender(...renderArgs);
    binding.update(planes);

    expect(material.clippingPlanes).toBe(clippingPlanes);
    expect(material.version).toEqual(materialVersion);

    const nextPlane = new Plane(new Vector3(0, 1, 0), 50);
    binding.update([nextPlane]);
    expect(material.clippingPlanes).toEqual([nextPlane]);
    expect(material.version).toEqual(materialVersion);
    binding.restore();
    expect(material.version).toEqual(materialVersion);
  });

  it("clips late-mounted objects and exempts ground subtrees", () => {
    const root = new Group();
    const ground = new Group();
    ground.userData[PROFILE_CLIPPING_EXEMPT] = true;
    const groundMaterial = new MeshBasicMaterial();
    ground.add(new Mesh(undefined, groundMaterial));
    root.add(ground);
    const binding = createProfileClippingBinding(root);
    binding.update(planes);

    const lateMaterial = new MeshBasicMaterial();
    root.add(new Mesh(undefined, lateMaterial));

    expect(groundMaterial.clippingPlanes).toBeNull();
    expect(groundMaterial.clipShadows).toEqual(false);
    expect(lateMaterial.clippingPlanes).toEqual(planes);

    binding.restore();
    const restoredMaterial = new MeshBasicMaterial();
    root.add(new Mesh(undefined, restoredMaterial));
    expect(restoredMaterial.clippingPlanes).toBeNull();
  });

  it("only applies the near plane to far-exempt subtrees", () => {
    const root = new Group();
    const bed = new Group();
    bed.userData[PROFILE_FAR_CLIPPING_EXEMPT] = true;
    const material = new MeshBasicMaterial();
    const lateMaterial = new MeshBasicMaterial();
    bed.add(new Mesh(undefined, material));
    root.add(bed);
    const binding = createProfileClippingBinding(root);
    binding.update(planes);
    bed.add(new Mesh(undefined, lateMaterial));

    expect(material.clippingPlanes).toEqual([planes[0]]);
    expect(lateMaterial.clippingPlanes).toEqual([planes[0]]);
    binding.restore();
  });

  it("clips materials assigned after a renderable object mounts", () => {
    const root = new Group();
    root.userData[PROFILE_FAR_CLIPPING_EXEMPT] = true;
    const initialMaterial = new MeshBasicMaterial();
    const mesh = new Mesh(undefined, initialMaterial);
    const originalBeforeRender = jest.fn();
    mesh.onBeforeRender = originalBeforeRender;
    root.add(mesh);
    const binding = createProfileClippingBinding(root);
    binding.update(planes);
    const replacement = new MeshBasicMaterial();
    replacement.clippingPlanes = [planes[0]];
    mesh.material = replacement;

    const renderArgs = [] as unknown as Parameters<
      typeof mesh.onBeforeRender
    >;
    mesh.onBeforeRender(...renderArgs);
    expect(originalBeforeRender).toHaveBeenCalled();
    expect(replacement.clippingPlanes).toEqual([planes[0]]);

    const nextPlane = new Plane(new Vector3(0, 1, 0), 50);
    binding.update([nextPlane]);
    expect(replacement.clippingPlanes).toEqual([nextPlane]);
    binding.restore();
    expect(replacement.clippingPlanes).toEqual([]);
    expect(mesh.onBeforeRender).toBe(originalBeforeRender);
  });

  it("clips late-attached cloud materials by the inherited near plane", () => {
    const root = new Group();
    root.userData[PROFILE_FAR_CLIPPING_EXEMPT] = true;
    const cloud = new Mesh();
    cloud.material = undefined as never;
    root.add(cloud);
    const binding = createProfileClippingBinding(root);
    binding.update(planes);
    const cloudMaterial = new MeshBasicMaterial();
    cloud.material = cloudMaterial;

    const renderArgs = [] as unknown as Parameters<
      typeof cloud.onBeforeRender
    >;
    cloud.onBeforeRender(...renderArgs);

    expect(cloudMaterial.clippingPlanes).toEqual([planes[0]]);
    binding.restore();
    expect(cloudMaterial.clippingPlanes).toBeNull();
  });
});

describe("useProfileClipping()", () => {
  const Harness = (props: {
    enabled: boolean;
    root: Group;
    planes: Plane[];
  }) => {
    useProfileClipping(props.enabled, props.root, props.planes);
    return <></>;
  };

  it("manages the clipping binding lifecycle", () => {
    const root = new Group();
    const material = new MeshBasicMaterial();
    root.add(new Mesh(undefined, material));
    const first = [new Plane(new Vector3(1, 0, 0), 0)];
    const second = [new Plane(new Vector3(0, 1, 0), 0)];
    const view = render(<Harness enabled={false} root={root} planes={first} />);
    expect(material.clippingPlanes).toBeNull();

    view.rerender(<Harness enabled={true} root={root} planes={first} />);
    expect(material.clippingPlanes).toEqual(first);
    view.rerender(<Harness enabled={true} root={root} planes={second} />);
    expect(material.clippingPlanes).toEqual(second);

    view.unmount();
    expect(material.clippingPlanes).toBeNull();
  });
});
