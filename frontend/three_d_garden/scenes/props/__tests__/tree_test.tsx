import React from "react";
import { render } from "@testing-library/react";
import { createRenderer, unmountRenderer } from
  "../../../../__test_support__/test_renderer";
import { TREE_BOUNDS, Tree, TreeProps, treePropsEqual } from "../tree";
import { Cone } from "@react-three/drei";
import { MeshPhongMaterial } from "../../../components";

describe("<Tree />", () => {
  const fakeProps = (): TreeProps => ({ size: TREE_BOUNDS });

  it("renders a centered pine tree", () => {
    const { container } = render(<Tree {...fakeProps()} />);
    expect(container).toContainHTML("tree-trunk");
    expect(container.querySelectorAll("[name='tree-foliage-layer']"))
      .toHaveLength(3);
  });

  it("scales to the requested size", () => {
    const wrapper = createRenderer(<Tree size={[500, 2000, 5000]} />);
    const tree = wrapper.root.findByProps({ name: "tree" });
    const centered = tree.findAll(node =>
      node.props.position?.join(",") == "0,0,-1250")[0];
    const trunk = wrapper.root.findByProps({ name: "tree-trunk" });
    const foliage = wrapper.root.findAll(node =>
      node.type == Cone && node.props.name == "tree-foliage-layer");
    const trunkMaterial = trunk.findByProps({ color: "#6b4423" });
    const foliageMaterials = foliage.flatMap(layer =>
      layer.findAllByType(MeshPhongMaterial));

    expect(tree.props.scale).toEqual([0.5, 2, 2]);
    expect(centered).toBeTruthy();
    expect(trunk.props.position).toEqual([0, 0, 400]);
    expect(trunkMaterial).toBeTruthy();
    expect(foliage).toHaveLength(3);
    expect(foliageMaterials).toHaveLength(3);
    unmountRenderer(wrapper);
  });

  it("compares tree sizes", () => {
    const p = fakeProps();
    expect(treePropsEqual(p, { ...p })).toBeTruthy();
    expect(treePropsEqual(p, { size: [1001, 1000, 2500] })).toBeFalsy();
  });
});
