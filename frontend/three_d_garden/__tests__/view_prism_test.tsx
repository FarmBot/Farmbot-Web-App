import React from "react";
import {
  actRenderer, createRenderer, unmountRenderer,
} from "../../__test_support__/test_renderer";
import {
  ViewPrism, VIEW_PRISM_BOUNDING_BOX_HALF_SIZE, VIEW_PRISM_DIMENSIONS,
  VIEW_PRISM_FACE_TEXTURE_RESOLUTION, VIEW_PRISM_LABEL_ROTATIONS,
  VIEW_PRISM_SCALE, VIEW_PRISM_TARGETS, VIEW_PRISM_TEXTURE_ANISOTROPY,
  VIEW_PRISM_TOP_CENTER, VIEW_PRISM_TOP_CENTER_BOUNDING_RADIUS,
} from "../view_prism";

const COLORS = {
  color: "#111",
  hoverColor: "#222",
  textColor: "#333",
  strokeColor: "#444",
};

describe("<ViewPrism />", () => {
  it("uses a centered 1.6 by 1 by 0.6 prism and fixed bounding box", () => {
    expect(VIEW_PRISM_DIMENSIONS).toEqual([1.6, 1, 0.6]);
    expect(VIEW_PRISM_BOUNDING_BOX_HALF_SIZE).toEqual(
      Math.hypot(0.8, 0.5, 0.3) * VIEW_PRISM_SCALE,
    );
    expect(VIEW_PRISM_TOP_CENTER).toEqual([0, 0, 0.3 * VIEW_PRISM_SCALE]);
    expect(VIEW_PRISM_TOP_CENTER_BOUNDING_RADIUS).toEqual(
      Math.hypot(0.8, 0.5, 0.6) * VIEW_PRISM_SCALE,
    );
    const wrapper = createRenderer(<ViewPrism
      {...COLORS}
      onDirection={jest.fn()} />);
    const bounds = wrapper.root.findByProps({ name: "view-prism-bounds" });
    const body = wrapper.root.findByProps({ name: "view-prism-body" });
    expect(bounds.props.position).toBeUndefined();
    expect(VIEW_PRISM_SCALE).toEqual(48);
    expect(bounds.props.scale).toEqual(48);
    expect(body.props.position).toBeUndefined();
    expect(body.props.userData.dimensions).toEqual([1.6, 1, 0.6]);
    expect(body.findByProps({ args: VIEW_PRISM_DIMENSIONS }).props.args)
      .toEqual([1.6, 1, 0.6]);
  });

  it("provides only the requested top and side shortcuts", () => {
    expect(VIEW_PRISM_TARGETS).toHaveLength(17);
    expect(VIEW_PRISM_TARGETS.filter(target => target.kind == "face"))
      .toHaveLength(5);
    expect(VIEW_PRISM_TARGETS.filter(target => target.kind == "edge"))
      .toHaveLength(8);
    expect(VIEW_PRISM_TARGETS.filter(target => target.kind == "corner"))
      .toHaveLength(4);
    expect(VIEW_PRISM_TARGETS.map(target => target.direction)).toEqual([
      [0, 0, 1],
      [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0],
      [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
      [1, 1, 1], [1, -1, 1], [-1, 1, 1], [-1, -1, 1],
      [1, 1, 0], [1, -1, 0], [-1, 1, 0], [-1, -1, 0],
    ]);
    expect(VIEW_PRISM_TARGETS.every(target => target.direction[2] >= 0))
      .toEqual(true);
  });

  it("partitions the top and sides without target gaps", () => {
    const getTarget = (id: string) => VIEW_PRISM_TARGETS.find(target =>
      target.id == id)!;
    const top = getTarget("face-top");
    const topXEdge = getTarget("edge-top-positive-x");
    const topYEdge = getTarget("edge-top-positive-y");
    const topCorner = getTarget(
      "corner-top-positive-x-positive-y",
    );
    const xFace = getTarget("face-positive-x");
    const sideEdge = getTarget("edge-side-positive-x-positive-y");
    expect(top.scale[0] / 2).toEqual(
      topXEdge.position[0] - topXEdge.scale[0] / 2,
    );
    expect(top.scale[1] / 2).toEqual(
      topYEdge.position[1] - topYEdge.scale[1] / 2,
    );
    expect(topXEdge.scale[1] / 2).toEqual(
      topCorner.position[1] - topCorner.scale[1] / 2,
    );
    expect(xFace.scale[1] / 2).toEqual(
      sideEdge.position[1] - sideEdge.scale[1] / 2,
    );
    expect(topCorner.scale[0]).toEqual(topCorner.scale[1]);
    expect(topCorner.scale[1]).toEqual(topCorner.scale[2]);
    expect(topCorner.scale[0]).toEqual(0.25);
    const topTargetBottom = top.position[2] - top.scale[2] / 2;
    const sideTargetTop = xFace.position[2] + xFace.scale[2] / 2;
    const sideTargetOuter = xFace.position[0] + xFace.scale[0] / 2;
    const topTargetOuter = top.position[2] + top.scale[2] / 2;
    const edgeTargetOuter = topXEdge.position[0] + topXEdge.scale[0] / 2;
    const sideEdgeOuter = sideEdge.position[0] + sideEdge.scale[0] / 2;
    const cornerXOuter = topCorner.position[0] + topCorner.scale[0] / 2;
    const cornerYOuter = topCorner.position[1] + topCorner.scale[1] / 2;
    const cornerZOuter = topCorner.position[2] + topCorner.scale[2] / 2;
    expect(topTargetBottom).toBeLessThan(VIEW_PRISM_DIMENSIONS[2] / 2);
    expect(topTargetBottom).toEqual(sideTargetTop);
    expect(sideTargetOuter - VIEW_PRISM_DIMENSIONS[0] / 2)
      .toBeCloseTo(0.005);
    expect(topTargetOuter - VIEW_PRISM_DIMENSIONS[2] / 2)
      .toBeCloseTo(0.005);
    expect(edgeTargetOuter - VIEW_PRISM_DIMENSIONS[0] / 2)
      .toBeCloseTo(0.005);
    expect(sideEdgeOuter - VIEW_PRISM_DIMENSIONS[0] / 2)
      .toBeCloseTo(0.005);
    expect(cornerXOuter - VIEW_PRISM_DIMENSIONS[0] / 2)
      .toBeCloseTo(0.005);
    expect(cornerYOuter - VIEW_PRISM_DIMENSIONS[1] / 2)
      .toBeCloseTo(0.005);
    expect(cornerZOuter - VIEW_PRISM_DIMENSIONS[2] / 2)
      .toBeCloseTo(0.005);
  });

  it("uses independent semantic directions for every hit target", () => {
    const onDirection = jest.fn();
    const wrapper = createRenderer(<ViewPrism
      {...COLORS}
      onDirection={onDirection} />);
    const targets = wrapper.root.findAll(node =>
      node.props.userData?.viewPrismTarget);
    expect(targets).toHaveLength(17);
    targets.forEach((target, index) => {
      const stopPropagation = jest.fn();
      actRenderer(() => target.props.onClick({ stopPropagation }));
      expect(stopPropagation).toHaveBeenCalled();
      expect(onDirection).toHaveBeenLastCalledWith(
        VIEW_PRISM_TARGETS[index].direction,
      );
    });
    expect(onDirection).toHaveBeenCalledTimes(17);
  });

  it("shows and clears the hover overlay", () => {
    const wrapper = createRenderer(<ViewPrism
      {...COLORS}
      onDirection={jest.fn()} />);
    const target = wrapper.root.findByProps({
      name: "view-prism-target-corner-top-positive-x-positive-y",
    });
    const getMaterial = () => target.findByProps({
      color: COLORS.hoverColor,
    });
    expect(getMaterial().props.opacity).toEqual(0);
    const stopPropagation = jest.fn();
    const canvas = document.createElement("canvas");
    canvas.style.cursor = "grab";
    const event = {
      nativeEvent: { target: canvas },
      stopPropagation,
    };
    actRenderer(() => target.props.onPointerOver(event));
    expect(getMaterial().props.opacity).toEqual(0.75);
    expect(canvas.style.cursor).toEqual("pointer");
    actRenderer(() => target.props.onPointerOut(event));
    expect(getMaterial().props.opacity).toEqual(0);
    expect(canvas.style.cursor).toEqual("grab");
    expect(stopPropagation).toHaveBeenCalledTimes(2);
  });

  it("keeps the canvas pointer while moving between targets", () => {
    const wrapper = createRenderer(<ViewPrism
      {...COLORS}
      onDirection={jest.fn()} />);
    const targets = wrapper.root.findAll(node =>
      node.props.userData?.viewPrismTarget).slice(0, 2);
    const canvas = document.createElement("canvas");
    canvas.style.cursor = "crosshair";
    const event = {
      nativeEvent: { target: canvas },
      stopPropagation: jest.fn(),
    };
    actRenderer(() => targets[0].props.onPointerOver(event));
    actRenderer(() => targets[1].props.onPointerOver(event));
    actRenderer(() => targets[0].props.onPointerOut(event));
    expect(canvas.style.cursor).toEqual("pointer");
    actRenderer(() => targets[1].props.onPointerOut(event));
    expect(canvas.style.cursor).toEqual("crosshair");
    actRenderer(() => targets[0].props.onPointerOver({
      ...event,
      nativeEvent: { target: document.createTextNode("invalid") },
    }));
    unmountRenderer(wrapper);
    expect(canvas.style.cursor).toEqual("crosshair");
  });

  it("restores the canvas cursor when unmounted during hover", () => {
    const wrapper = createRenderer(<ViewPrism
      {...COLORS}
      onDirection={jest.fn()} />);
    const target = wrapper.root.findAll(node =>
      node.props.userData?.viewPrismTarget)[0];
    const canvas = document.createElement("canvas");
    canvas.style.cursor = "grab";
    actRenderer(() => target.props.onPointerOver({
      nativeEvent: { target: canvas },
      stopPropagation: jest.fn(),
    }));
    expect(canvas.style.cursor).toEqual("pointer");
    unmountRenderer(wrapper);
    expect(canvas.style.cursor).toEqual("grab");
  });

  it("creates aspect-correct labeled materials and disposes textures", () => {
    const wrapper = createRenderer(<ViewPrism
      {...COLORS}
      borderWidth={8}
      onDirection={jest.fn()} />);
    const body = wrapper.root.findByProps({ name: "view-prism-body" });
    const materials = body.findAll(node => !!node.props.map);
    expect(materials).toHaveLength(6);
    const textures = materials.map(material => material.props.map);
    expect(textures.map(texture => [
      texture.image.width,
      texture.image.height,
    ])).toEqual([
      [512, 853], [512, 853], [1365, 512], [1365, 512],
      [819, 512], [819, 512],
    ]);
    expect(VIEW_PRISM_FACE_TEXTURE_RESOLUTION).toEqual(512);
    textures.forEach(texture =>
      expect(texture.anisotropy).toEqual(VIEW_PRISM_TEXTURE_ANISOTROPY));
    expect(VIEW_PRISM_LABEL_ROTATIONS).toEqual({
      "+X": -Math.PI / 2,
      "-X": Math.PI / 2,
      "+Y": Math.PI,
      "-Y": 0,
      TOP: 0,
    });
    const dispose = textures.map(texture =>
      jest.spyOn(texture, "dispose"));
    unmountRenderer(wrapper);
    dispose.forEach(spy => expect(spy).toHaveBeenCalled());
  });
});
