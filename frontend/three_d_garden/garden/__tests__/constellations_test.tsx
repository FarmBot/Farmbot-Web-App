import React from "react";
import {
  advanceConstellationAnimation,
  cameraSideShaderModification,
  ConstellationAnimationState,
  constellationImageShaderModification,
  constellationLineShaderModification,
  Constellations,
  ConstellationsHandle,
  createConstellationAnimationState,
  createConstellationPlacements,
  generateStars,
  getBackgroundStarGeometry,
  getConstellationImageGeometry,
  getConstellationLineGeometry,
  getConstellationRuntime,
  getConstellationStarGeometry,
  getStarData,
  headingDistance,
  LoadedConstellations,
  projectConstellationPoint,
  resetConstellationAnimation,
  resetConstellationStartTimes,
  setConstellationNightFactor,
  setConstellationStartTime,
  starShaderModification,
  updateConstellationStartTime,
} from "../constellations";
import { CropConstellationCatalog } from "../constellation_data";
import * as constellationData from "../constellation_data";
import {
  LineSegments, Mesh, Points,
} from "../../components";
import {
  BufferAttribute, BufferGeometry, Material,
  WebGLProgramParametersWithUniforms,
} from "three";
import {
  actRenderer, createRenderer, unmountRenderer,
} from "../../../__test_support__/test_renderer";
import { BigDistance } from "../../constants";

const fakeCatalog = (): CropConstellationCatalog => ({
  coordinateScale: 0.01,
  totalPointCount: 6,
  constellations: [
    {
      cropSlug: "california-poppy",
      pointCount: 3,
      points: new Int8Array([-10, -10, 10, -10, 0, 10]),
    },
    {
      cropSlug: "brussels-sprout",
      pointCount: 3,
      points: new Int8Array([-8, -8, 8, -8, 0, 8]),
    },
  ],
});

const shader = () => ({
  uniforms: {},
  vertexShader: [
    "#include <common>",
    "#include <begin_vertex>",
    "#include <project_vertex>",
    "gl_PointSize = size;",
  ].join("\n"),
  fragmentShader: [
    "#include <common>",
    "#include <color_fragment>",
    "#include <map_fragment>",
    "#include <clipping_planes_fragment>",
  ].join("\n"),
}) as WebGLProgramParametersWithUniforms;

describe("constellation placement", () => {
  it("spaces crops evenly while varying elevation and size", () => {
    const values = [0, 1, 0.5, 0.25];
    const placements = createConstellationPlacements(
      fakeCatalog(),
      () => values.shift() || 0,
    );
    expect(placements).toEqual([
      { heading: 0, phi: 20, angularSize: 25 },
      { heading: 180, phi: 55, angularSize: 13.75 },
    ]);
  });

  it("projects points onto the sky sphere", () => {
    const projected = projectConstellationPoint([0.25, -0.25], 90);
    expect(Math.hypot(...projected)).toBeCloseTo(BigDistance.sunVisual);
  });

  it("measures wrapped heading distance", () => {
    expect(headingDistance(350, 10)).toEqual(20);
    expect(headingDistance(10, 200)).toEqual(170);
  });
});

describe("constellation geometry", () => {
  it("builds and caches stars, lines, and atlas images", () => {
    const catalog = fakeCatalog();
    const runtime = getConstellationRuntime(catalog);
    expect(getConstellationRuntime(catalog)).toBe(runtime);

    const starData = getStarData(runtime);
    expect(getStarData(runtime)).toBe(starData);
    expect(starData.sizes).toHaveLength(2305 + catalog.totalPointCount);
    const backgroundStars = getBackgroundStarGeometry(runtime);
    expect(getBackgroundStarGeometry(runtime)).toBe(backgroundStars);
    expect(backgroundStars.getAttribute("position").count).toEqual(2305);
    expect(backgroundStars.getAttribute("starSize").count).toEqual(2305);
    const constellationStars = getConstellationStarGeometry(runtime);
    expect(getConstellationStarGeometry(runtime)).toBe(constellationStars);
    expect(constellationStars.getAttribute("position").count)
      .toEqual(catalog.totalPointCount);
    expect(constellationStars.getAttribute("starSize").count)
      .toEqual(catalog.totalPointCount);

    const lines = getConstellationLineGeometry(runtime);
    expect(getConstellationLineGeometry(runtime)).toBe(lines);
    expect(lines.getAttribute("position").count).toEqual(12);
    expect(lines.getAttribute("constellationLineStart").count).toEqual(12);
    expect(lines.getAttribute("constellationSegmentStart").count).toEqual(12);
    expect(lines.getAttribute("constellationSegmentEnd").count).toEqual(12);
    expect(runtime.lineVertexRanges).toEqual([
      { start: 0, count: 6 },
      { start: 6, count: 6 },
    ]);

    const images = getConstellationImageGeometry(runtime);
    expect(getConstellationImageGeometry(runtime)).toBe(images);
    expect(images.getAttribute("position").count).toEqual(768);
    expect(images.getAttribute("uv").count).toEqual(768);
    expect(runtime.imageVertexRanges).toEqual([
      { start: 0, count: 384 },
      { start: 384, count: 384 },
    ]);
  });

  it("generates background and crop stars", () => {
    const catalog = fakeCatalog();
    const placements = createConstellationPlacements(catalog, () => 0);
    const stars = generateStars(catalog, placements, () => 0.5);
    expect(stars.positions).toHaveLength(stars.sizes.length * 3);
    expect(stars.sizes[0]).toEqual(1.25);
    expect(stars.sizes[2305]).toEqual(2);
  });

  it("requires every crop image to have an atlas frame", () => {
    const catalog = fakeCatalog();
    catalog.constellations[0].cropSlug = "missing-crop";
    const runtime = getConstellationRuntime(catalog);
    expect(() => getConstellationImageGeometry(runtime))
      .toThrow("Missing atlas frame for missing-crop");
  });

  it("updates and resets individual animation attributes", () => {
    const runtime = getConstellationRuntime(fakeCatalog());
    const lines = getConstellationLineGeometry(runtime);
    getConstellationImageGeometry(runtime);

    updateConstellationStartTime(lines, undefined, 5);
    setConstellationStartTime(runtime, 1, 5);
    const lineTimes = lines.getAttribute("constellationStartTime")
      .array as Float32Array;
    expect([...lineTimes.slice(0, 6)]).toEqual(Array(6).fill(-1_000_000));
    expect([...lineTimes.slice(6)]).toEqual(Array(6).fill(5));

    resetConstellationStartTimes(runtime);
    expect([...lineTimes]).toEqual(Array(12).fill(-1_000_000));
    expect((lines.getAttribute("constellationStartTime") as BufferAttribute)
      .version).toBeGreaterThan(0);
  });
});

describe("constellation animation", () => {
  it("starts only eligible, separated constellations", () => {
    const runtime = getConstellationRuntime(fakeCatalog());
    const state = createConstellationAnimationState(runtime.catalog);

    advanceConstellationAnimation(runtime, state, 0, () => 0);
    expect(state.startTimes[0]).toEqual(0);
    expect(state.nextStartTime).toEqual(1);

    advanceConstellationAnimation(runtime, state, 0.5, () => 0);
    expect(state.nextStartTime).toEqual(1);

    advanceConstellationAnimation(runtime, state, 1, () => 0);
    expect(state.startTimes[1]).toEqual(1);

    resetConstellationAnimation(runtime, state);
    expect(state).toEqual({
      nextStartTime: 0,
      startTimes: [-1_000_000, -1_000_000],
    });
  });

  it("waits when every constellation is already active", () => {
    const catalog = fakeCatalog();
    catalog.constellations.splice(1);
    catalog.totalPointCount = 3;
    const runtime = getConstellationRuntime(catalog);
    const state: ConstellationAnimationState = {
      nextStartTime: 0,
      startTimes: [0],
    };

    advanceConstellationAnimation(runtime, state, 1, () => 0);
    expect(state.startTimes).toEqual([0]);
    expect(state.nextStartTime).toEqual(2);
  });
});

describe("constellation materials", () => {
  it("applies night opacity to every material that is mounted", () => {
    const backgroundStars = { opacity: 0 } as Material;
    const constellationStars = { opacity: 0 } as Material;
    const lines = { opacity: 0 } as Material;
    const images = { opacity: 0 } as Material;
    setConstellationNightFactor({
      backgroundStars: { current: backgroundStars },
      constellationStars: { current: constellationStars },
      lines: { current: lines },
      images: { current: images },
    }, 0.5);
    expect(backgroundStars.opacity).toEqual(0.5);
    expect(constellationStars.opacity).toEqual(0.5);
    expect(lines.opacity).toEqual(0.3);
    expect(images.opacity).toEqual(0.4);

    setConstellationNightFactor({
      // eslint-disable-next-line no-null/no-null
      backgroundStars: { current: null },
      // eslint-disable-next-line no-null/no-null
      constellationStars: { current: null },
      // eslint-disable-next-line no-null/no-null
      lines: { current: null },
      // eslint-disable-next-line no-null/no-null
      images: { current: null },
    }, 1);
  });

  it("renders the loaded constellation scene and exposes opacity control", () => {
    const ref = React.createRef<ConstellationsHandle>();
    const wrapper = createRenderer(<LoadedConstellations
      ref={ref}
      catalog={fakeCatalog()}
      enabled={true}
      debug={false}
      stargazing={false}
      nightFactor={0.5} />);
    expect(wrapper.root.findAllByType(Mesh)).toHaveLength(1);
    expect(wrapper.root.findAllByType(LineSegments).length).toBeGreaterThan(0);
    expect(wrapper.root.findAllByType(Points).length).toBeGreaterThan(0);
    ref.current?.setNightFactor(0.25);
    unmountRenderer(wrapper);
  });

  it("keeps background stars when constellations are disabled", () => {
    const fetchCatalog = jest.spyOn(globalThis, "fetch")
      .mockImplementation(jest.fn());
    const wrapper = createRenderer(<Constellations
      enabled={false}
      debug={false}
      stargazing={false}
      nightFactor={1} />);
    expect(wrapper.root.findAllByType(Mesh)).toHaveLength(0);
    const points = wrapper.root.findAllByType(Points);
    expect(points).toHaveLength(1);
    expect(points[0].props.geometry.getAttribute("position").count)
      .toEqual(2305);
    expect(fetchCatalog).not.toHaveBeenCalled();
    unmountRenderer(wrapper);
    fetchCatalog.mockRestore();
  });

  it("keeps background stars when the constellation catalog fails", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const readCatalog = jest
      .spyOn(constellationData, "readCropConstellationCatalog")
      .mockImplementation(() => {
        throw new Error("catalog unavailable");
      });
    const wrapper = createRenderer(<Constellations
      enabled={true}
      debug={false}
      stargazing={false}
      nightFactor={1} />);
    const points = wrapper.root.findAllByType(Points);
    expect(points).toHaveLength(1);
    expect(points[0].props.geometry.getAttribute("position").count)
      .toEqual(2305);
    unmountRenderer(wrapper);
    readCatalog.mockRestore();
    consoleError.mockRestore();
  });

  it("disables camera-side clipping while stargazing", () => {
    const scene = (stargazing: boolean) => <LoadedConstellations
      catalog={fakeCatalog()}
      enabled={true}
      debug={false}
      stargazing={stargazing}
      nightFactor={1} />;
    const wrapper = createRenderer(scene(false));
    const cameraSideClipValues = () => wrapper.root.findAll(node =>
      typeof node.type == "string"
      && typeof node.props.onBeforeCompile == "function")
      .map(node => {
        const modified = shader();
        node.props.onBeforeCompile(modified);
        return modified.uniforms.cameraSideClipEnabled.value;
      });
    expect(cameraSideClipValues()).toEqual([1, 1, 1, 1]);

    actRenderer(() => wrapper.update(scene(true)));

    expect(cameraSideClipValues()).toEqual([0, 0, 0, 0]);
    unmountRenderer(wrapper);
  });

  it("shows all outlines and images without scheduling debug animations", () => {
    const catalog = fakeCatalog();
    const readCatalog = jest
      .spyOn(constellationData, "readCropConstellationCatalog")
      .mockReturnValue(catalog);
    const scene = (debug: boolean) => <Constellations
      enabled={false}
      debug={debug}
      stargazing={false}
      nightFactor={1} />;
    const wrapper = createRenderer(scene(true));
    const debugValues = () => wrapper.root.findAll(node =>
      typeof node.type == "string"
      && typeof node.props.onBeforeCompile == "function")
      .map(node => {
        const modified = shader();
        node.props.onBeforeCompile(modified);
        return modified.uniforms.constellationDebug?.value;
      })
      .filter(value => value != undefined);
    expect(debugValues()).toEqual([1, 1]);
    expect(wrapper.root.findAllByType(Mesh)).toHaveLength(1);
    const lineTimes = getConstellationLineGeometry(
      getConstellationRuntime(catalog),
    ).getAttribute("constellationStartTime").array as Float32Array;
    expect([...lineTimes]).toEqual(Array(12).fill(-1_000_000));

    actRenderer(() => wrapper.update(scene(false)));
    expect(debugValues()).toEqual([]);
    expect(wrapper.root.findAllByType(Mesh)).toHaveLength(0);
    unmountRenderer(wrapper);
    readCatalog.mockRestore();
  });
});

describe("constellation shaders", () => {
  it("clips camera-side geometry", () => {
    const modified = shader();
    cameraSideShaderModification(modified);
    expect(modified.vertexShader).toContain("starCameraAlignment");
    expect(modified.vertexShader).toContain("0.866025");
    expect(modified.uniforms.cameraSideClipEnabled.value).toEqual(1);
  });

  it("draws and fades the continuous contour", () => {
    const modified = shader();
    constellationLineShaderModification(modified);
    expect(modified.uniforms.constellationTime).toBeDefined();
    expect(modified.uniforms.constellationDebug.value).toEqual(0);
    expect(modified.vertexShader).toContain("constellationSegmentProgress");
    expect(modified.vertexShader).toContain("constellationDebug");
    expect(modified.fragmentShader).toContain("vConstellationVisibility");
    expect(modified.fragmentShader).toContain("discard");
  });

  it("desaturates and fades the crop image", () => {
    const modified = shader();
    constellationImageShaderModification(modified);
    expect(modified.uniforms.constellationTime).toBeDefined();
    expect(modified.uniforms.constellationDebug.value).toEqual(0);
    expect(modified.vertexShader).toContain("constellationImageFadeOut");
    expect(modified.vertexShader).toContain("constellationDebug");
    expect(modified.fragmentShader).toContain("constellationImageLuminance");
    expect(modified.fragmentShader).toContain("discard");
  });

  it("applies individual star sizes and camera clipping", () => {
    const modified = shader();
    starShaderModification(modified);
    expect(modified.vertexShader).toContain("attribute float starSize");
    expect(modified.vertexShader).toContain("size * starSize");
    expect(modified.vertexShader).toContain("starCameraAlignment");
  });

  it("updates a standalone start-time attribute", () => {
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "constellationStartTime",
      new BufferAttribute(new Float32Array(4), 1),
    );
    updateConstellationStartTime(
      geometry,
      { start: 1, count: 2 },
      7,
    );
    expect([...geometry.getAttribute("constellationStartTime").array])
      .toEqual([0, 7, 7, 0]);
  });
});
