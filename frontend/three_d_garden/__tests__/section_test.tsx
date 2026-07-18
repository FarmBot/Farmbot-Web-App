import {
  Group, Mesh, MeshBasicMaterial, Plane, Vector3,
} from "three";
import {
  createSectionClippingBinding,
  filterSectionIntersections,
  getSectionClippingPlanes, getSectionOutsidePlaneConstants,
  SECTION_CLIPPING_EXEMPT,
  SECTION_FAR_CLIPPING_EXEMPT, SectionOutsidePlaneConstants,
  useAnimatedSectionPlanes, useSectionClipping,
} from "../section";
import React from "react";
import { render, waitFor } from "@testing-library/react";
import * as reactSpring from "@react-spring/three";

describe("getSectionClippingPlanes()", () => {
  const config = {
    bedLengthOuter: 1000,
    bedWidthOuter: 600,
    bedXOffset: 0,
    bedYOffset: 0,
    mirrorX: false,
    mirrorY: false,
  };

  it("keeps the selected X slice", () => {
    const planes = getSectionClippingPlanes(config, "x", 100, 200);
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
    const planes = getSectionClippingPlanes(
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
    expect(getSectionOutsidePlaneConstants({
      ...config,
      bedXOffset: 75,
      bedYOffset: 20,
      mirrorX: true,
      mirrorY: true,
    })).toEqual({ x: [1500, 1500], y: [1300, 1300] });
  });
});

describe("filterSectionIntersections()", () => {
  it("removes intersections hidden by material clipping planes", () => {
    const material = new MeshBasicMaterial();
    material.clippingPlanes = [new Plane(new Vector3(1, 0, 0), 0)];
    const mesh = new Mesh(undefined, material);
    const intersections = [
      { object: mesh, point: new Vector3(-1, 0, 0) },
      { instanceId: 2, object: mesh, point: new Vector3(1, 0, 0) },
    ] as never;
    const visible = filterSectionIntersections(intersections);
    expect(visible).toHaveLength(1);
    expect(visible[0].instanceId).toEqual(2);
  });

  it("keeps intersections without clipping planes", () => {
    const mesh = new Mesh(undefined, new MeshBasicMaterial());
    const intersections = [
      { object: mesh, point: new Vector3(-1, 0, 0) },
    ] as never;
    expect(filterSectionIntersections(intersections)).toEqual(intersections);
  });
});

describe("useAnimatedSectionPlanes()", () => {
  it("matches dragged plane targets without starting a spring", () => {
    const api = { start: jest.fn(), stop: jest.fn(), set: jest.fn() };
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation((() => [{}, api]) as never);
    const planesFor = (center: number) => [
      new Plane(new Vector3(1, 0, 0), -center + 50),
      new Plane(new Vector3(-1, 0, 0), center + 50),
    ];
    const Probe = ({ center, immediate }: {
      center: number;
      immediate: boolean;
    }) => {
      const animated = useAnimatedSectionPlanes(
        true,
        "x",
        planesFor(center),
        false,
        { x: [1500, 1500], y: [900, 900] },
        immediate,
      );
      return <div
        data-first={animated.planes[0].constant}
        data-second={animated.planes[1].constant} />;
    };
    const { container, rerender } = render(
      <Probe center={100} immediate={true} />,
    );
    expect(container.firstChild).toHaveAttribute("data-first", "-50");
    expect(container.firstChild).toHaveAttribute("data-second", "150");
    rerender(<Probe center={325} immediate={true} />);
    expect(container.firstChild).toHaveAttribute("data-first", "-275");
    expect(container.firstChild).toHaveAttribute("data-second", "375");
    expect(api.set).toHaveBeenLastCalledWith({
      first: -275,
      second: 375,
      opacity: 1,
    });
    expect(api.start).not.toHaveBeenCalled();
    rerender(<Probe center={325} immediate={false} />);
    expect(api.start).toHaveBeenCalledWith(expect.objectContaining({
      immediate: false,
    }));
    springSpy.mockRestore();
  });

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
    const api = { start, stop, set: jest.fn() };
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation((() => [{}, api]) as never);
    const planes = getSectionClippingPlanes({
      bedLengthOuter: 1000,
      bedWidthOuter: 600,
      bedXOffset: 0,
      bedYOffset: 0,
      mirrorX: false,
      mirrorY: false,
    }, "x", 100, 200);
    const Probe = (props: { enabled: boolean; axis: "x" | "y" }) => {
      const animated = useAnimatedSectionPlanes(
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

  it("fades controls out before clipping unmounts", () => {
    const starts: {
      opacity?: number;
      from?: { opacity?: number };
      onChange?(result: { value: { opacity: number } }): void;
      onRest?(): void;
    }[] = [];
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
      const animated = useAnimatedSectionPlanes(enabled, "x", planes);
      return <div data-mounted={animated.mounted}
        data-opacity={animated.opacity} />;
    };
    const { container, rerender } = render(<Probe enabled={true} />);
    expect(container.firstChild).toHaveAttribute("data-mounted", "true");
    expect(container.firstChild).toHaveAttribute("data-opacity", "1");
    rerender(<Probe enabled={false} />);
    expect(container.firstChild).toHaveAttribute("data-mounted", "true");
    const exit = starts[starts.length - 1];
    expect(exit.from?.opacity).toEqual(1);
    expect(exit.opacity).toEqual(0);
    React.act(() => exit.onChange?.({ value: { opacity: 0.4 } }));
    expect(container.firstChild).toHaveAttribute("data-opacity", "0.4");
    React.act(() => exit.onRest?.());
    expect(container.firstChild).toHaveAttribute("data-mounted", "false");
    expect(container.firstChild).toHaveAttribute("data-opacity", "0");
    springSpy.mockRestore();
  });

  it("fades controls in with the clipping planes", () => {
    const starts: {
      first?: number;
      second?: number;
      opacity?: number;
      from?: {
        first?: number;
        second?: number;
        opacity?: number;
      };
      onChange?(result: { value: { opacity: number } }): void;
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
    const outsidePlaneConstants: SectionOutsidePlaneConstants = {
      x: [700, 800],
      y: [500, 600],
    };
    const Probe = ({ enabled }: { enabled: boolean }) => {
      const animated = useAnimatedSectionPlanes(
        enabled,
        "x",
        planes,
        false,
        outsidePlaneConstants,
      );
      return <div data-mounted={animated.mounted}
        data-opacity={animated.opacity} />;
    };
    const { container, rerender } = render(<Probe enabled={false} />);
    React.act(() => starts[starts.length - 1]?.onRest?.());
    rerender(<Probe enabled={true} />);
    expect(container.firstChild).toHaveAttribute("data-mounted", "true");
    expect(container.firstChild).toHaveAttribute("data-opacity", "0");
    const enter = starts[starts.length - 1];
    expect(enter.from).toEqual({
      first: 700,
      second: 800,
      opacity: 0,
    });
    expect(enter.first).toEqual(100);
    expect(enter.second).toEqual(100);
    expect(enter.opacity).toEqual(1);
    React.act(() => enter.onChange?.({ value: { opacity: 0.6 } }));
    expect(container.firstChild).toHaveAttribute("data-opacity", "0.6");
    React.act(() => enter.onChange?.({ value: { opacity: 1 } }));
    expect(container.firstChild).toHaveAttribute("data-opacity", "1");
    React.act(() => enter.onRest?.());
    springSpy.mockRestore();
  });

  it("keeps the old axis until its outward spring rests", () => {
    const starts: {
      first?: number;
      second?: number;
      opacity?: number;
      config?: object;
      onChange?(result: { value: { opacity: number } }): void;
      onRest?(): void;
    }[] = [];
    const api = {
      start: jest.fn((props: typeof starts[number]) => starts.push(props)),
      stop: jest.fn(),
      set: jest.fn(),
    };
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation((() => [{}, api]) as never);
    const planes = [
      new Plane(new Vector3(1, 0, 0), 100),
      new Plane(new Vector3(-1, 0, 0), 100),
    ];
    const outsidePlaneConstants: SectionOutsidePlaneConstants = {
      x: [1500, 1600],
      y: [900, 1000],
    };
    const Probe = ({ axis }: { axis: "x" | "y" }) => {
      const animated = useAnimatedSectionPlanes(
        true,
        axis,
        planes,
        false,
        outsidePlaneConstants,
      );
      return <div data-axis={animated.axis}
        data-opacity={animated.opacity} />;
    };
    const { container, rerender } = render(<Probe axis={"x"} />);
    rerender(<Probe axis={"y"} />);

    expect(container.firstChild).toHaveAttribute("data-axis", "x");
    expect(starts[starts.length - 1]).toEqual(expect.objectContaining({
      first: 1500,
      second: 1600,
      opacity: 0,
      config: { duration: 200 },
    }));
    const exit = starts[starts.length - 1];
    React.act(() => exit.onChange?.({ value: { opacity: 0.4 } }));
    expect(container.firstChild).toHaveAttribute("data-opacity", "0.4");
    React.act(() => exit.onRest?.());
    expect(container.firstChild).toHaveAttribute("data-axis", "y");
    expect(api.set).toHaveBeenCalledWith({
      first: 900,
      second: 1000,
      opacity: 0,
    });
    expect(starts[starts.length - 1]).toEqual(expect.objectContaining({
      first: 100,
      second: 100,
      opacity: 1,
    }));
    springSpy.mockRestore();
  });

  it("starts a changed disabled axis at its outside endpoints", () => {
    const starts: {
      first?: number;
      second?: number;
      from?: { first?: number; second?: number; opacity?: number };
    }[] = [];
    const api = {
      start: jest.fn((props: typeof starts[number]) => starts.push(props)),
      stop: jest.fn(),
      set: jest.fn(),
    };
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation((() => [{}, api]) as never);
    const planes = [
      new Plane(new Vector3(1, 0, 0), 100),
      new Plane(new Vector3(-1, 0, 0), 100),
    ];
    const outsidePlaneConstants: SectionOutsidePlaneConstants = {
      x: [700, 800],
      y: [500, 600],
    };
    const Probe = (props: { enabled: boolean; axis: "x" | "y" }) => {
      const animated = useAnimatedSectionPlanes(
        props.enabled,
        props.axis,
        planes,
        false,
        outsidePlaneConstants,
      );
      return <div data-axis={animated.axis} />;
    };
    const { container, rerender } = render(
      <Probe enabled={false} axis={"x"} />,
    );
    rerender(<Probe enabled={false} axis={"y"} />);
    expect(container.firstChild).toHaveAttribute("data-axis", "y");
    expect(api.set).toHaveBeenLastCalledWith({
      first: 500,
      second: 600,
      opacity: 0,
    });

    rerender(<Probe enabled={true} axis={"y"} />);
    expect(starts[starts.length - 1]).toEqual(expect.objectContaining({
      from: { first: 500, second: 600, opacity: 0 },
      first: 100,
      second: 100,
    }));
    springSpy.mockRestore();
  });

  it("refreshes changed outside endpoints while disabled", () => {
    const starts: {
      from?: { first?: number; second?: number; opacity?: number };
    }[] = [];
    const api = {
      start: jest.fn((props: typeof starts[number]) => starts.push(props)),
      stop: jest.fn(),
      set: jest.fn(),
    };
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation((() => [{}, api]) as never);
    const planes = [
      new Plane(new Vector3(1, 0, 0), 100),
      new Plane(new Vector3(-1, 0, 0), 100),
    ];
    const Probe = (props: {
      enabled: boolean;
      outside: SectionOutsidePlaneConstants;
    }) => {
      useAnimatedSectionPlanes(
        props.enabled,
        "x",
        planes,
        false,
        props.outside,
      );
      return <></>;
    };
    const { rerender } = render(<Probe
      enabled={false}
      outside={{ x: [700, 800], y: [500, 600] }} />);
    rerender(<Probe
      enabled={false}
      outside={{ x: [900, 1000], y: [500, 600] }} />);
    expect(api.set).toHaveBeenLastCalledWith({
      first: 900,
      second: 1000,
      opacity: 0,
    });

    rerender(<Probe
      enabled={true}
      outside={{ x: [900, 1000], y: [500, 600] }} />);
    expect(starts[starts.length - 1].from).toEqual({
      first: 900,
      second: 1000,
      opacity: 0,
    });
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
    const outsidePlaneConstants: SectionOutsidePlaneConstants = {
      x: [1500, 1500],
      y: [1300, 1300],
    };
    const Probe = ({ axis }: { axis: "x" | "y" }) => {
      const animated = useAnimatedSectionPlanes(
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
      opacity: 1,
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
    const outsidePlaneConstants: SectionOutsidePlaneConstants = {
      x: [1500, 1600],
      y: [1300, 1300],
    };
    const Probe = ({ enabled }: { enabled: boolean }) => {
      const animated = useAnimatedSectionPlanes(
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

    expect(exit.from).toEqual({
      first: -250,
      second: 350,
      opacity: 1,
    });
    expect(exit.first).toEqual(1500);
    expect(exit.second).toEqual(1600);
    React.act(() => exit.onChange?.({
      value: { first: 1500, second: 1600 },
    }));
    expect(container.firstChild).toHaveAttribute("data-first", "1500");
    expect(container.firstChild).toHaveAttribute("data-second", "1600");
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
      const animated = useAnimatedSectionPlanes(true, "x", planes, true);
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

  it("springs the center when follow is toggled on and off", () => {
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
    const Probe = (props: { center: number; follow: boolean }) => {
      const planes = [
        new Plane(new Vector3(1, 0, 0), -props.center + 50),
        new Plane(new Vector3(-1, 0, 0), props.center + 50),
      ];
      const animated = useAnimatedSectionPlanes(
        true, "x", planes, props.follow);
      const lower = -animated.planes[0].constant;
      const upper = animated.planes[1].constant;
      return <div data-center={(lower + upper) / 2} />;
    };
    const { container, rerender } = render(
      <Probe center={100} follow={false} />,
    );
    const initial = starts[starts.length - 1];
    React.act(() => initial.onChange?.({
      value: { first: -50, second: 150 },
    }));
    React.act(() => initial.onRest?.());

    rerender(<Probe center={400} follow={true} />);
    expect(container.firstChild).toHaveAttribute("data-center", "100");
    const followOn = starts[starts.length - 1];
    expect(followOn.from).toEqual({
      first: -50,
      second: 150,
      opacity: 1,
    });
    expect(followOn.first).toEqual(-350);
    expect(followOn.second).toEqual(450);
    React.act(() => followOn.onChange?.({
      value: { first: -150, second: 250 },
    }));
    expect(container.firstChild).toHaveAttribute("data-center", "200");
    React.act(() => followOn.onRest?.());
    expect(container.firstChild).toHaveAttribute("data-center", "400");

    rerender(<Probe center={100} follow={false} />);
    expect(container.firstChild).toHaveAttribute("data-center", "400");
    const followOff = starts[starts.length - 1];
    expect(followOff.from).toEqual({
      first: -350,
      second: 450,
      opacity: 1,
    });
    expect(followOff.first).toEqual(-50);
    expect(followOff.second).toEqual(150);
    React.act(() => followOff.onRest?.());
    expect(container.firstChild).toHaveAttribute("data-center", "100");
    springSpy.mockRestore();
  });
});

describe("createSectionClippingBinding()", () => {
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

    const binding = createSectionClippingBinding(root);
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
    const binding = createSectionClippingBinding(root);
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
    ground.userData[SECTION_CLIPPING_EXEMPT] = true;
    const groundMaterial = new MeshBasicMaterial();
    ground.add(new Mesh(undefined, groundMaterial));
    root.add(ground);
    const binding = createSectionClippingBinding(root);
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
    bed.userData[SECTION_FAR_CLIPPING_EXEMPT] = true;
    const material = new MeshBasicMaterial();
    const lateMaterial = new MeshBasicMaterial();
    bed.add(new Mesh(undefined, material));
    root.add(bed);
    const binding = createSectionClippingBinding(root);
    binding.update(planes);
    bed.add(new Mesh(undefined, lateMaterial));

    expect(material.clippingPlanes).toEqual([planes[0]]);
    expect(lateMaterial.clippingPlanes).toEqual([planes[0]]);
    binding.restore();
  });

  it("applies both planes to far-exempt subtrees when cutting all", () => {
    const root = new Group();
    root.userData[SECTION_FAR_CLIPPING_EXEMPT] = true;
    const material = new MeshBasicMaterial();
    root.add(new Mesh(undefined, material));
    const binding = createSectionClippingBinding(root, true);
    binding.update(planes);

    expect(material.clippingPlanes).toEqual(planes);
    binding.restore();
  });

  it("clips materials assigned after a renderable object mounts", () => {
    const root = new Group();
    root.userData[SECTION_FAR_CLIPPING_EXEMPT] = true;
    const initialMaterial = new MeshBasicMaterial();
    const mesh = new Mesh(undefined, initialMaterial);
    const originalBeforeRender = jest.fn();
    mesh.onBeforeRender = originalBeforeRender;
    root.add(mesh);
    const binding = createSectionClippingBinding(root);
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
    root.userData[SECTION_FAR_CLIPPING_EXEMPT] = true;
    const cloud = new Mesh();
    cloud.material = undefined as never;
    root.add(cloud);
    const binding = createSectionClippingBinding(root);
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

describe("useSectionClipping()", () => {
  const Harness = (props: {
    enabled: boolean;
    root: Group;
    planes: Plane[];
    cutAll?: boolean;
  }) => {
    useSectionClipping(
      props.enabled,
      props.root,
      props.planes,
      props.cutAll,
    );
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

    root.userData[SECTION_FAR_CLIPPING_EXEMPT] = true;
    view.rerender(<Harness enabled={true} root={root}
      planes={second} cutAll={true} />);
    expect(material.clippingPlanes).toEqual(second);

    view.unmount();
    expect(material.clippingPlanes).toBeNull();
  });
});
