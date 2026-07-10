import React from "react";
import { render } from "@testing-library/react";
import * as THREE from "three";
import {
  createRenderer,
  unmountRenderer,
} from "../../../../__test_support__/test_renderer";
import {
  GantryCornerBracketMaterial,
  MountedIdlerPulleyMaterial,
  PartName,
  SeedTroughHolderMaterial,
} from "../../../constants";
import {
  mountedIdlerPulleyGeometry,
  MountedIdlerPulleyFull,
  MountedIdlerPulleyModel,
} from "../mounted_idler_pulley";
import {
  RightGantryCornerBracketFull,
  RightGantryCornerBracketModel,
  rightGantryCornerBracketGeometry,
} from "../gantry_corner_bracket";
import {
  SeedTroughHolderFull,
  SeedTroughHolderModel,
} from "../seed_trough_holder";

const mesh = () => new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));

const material = (color: THREE.ColorRepresentation) =>
  new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide });

describe("solid FarmBot hardware batching", () => {
  it("batches a mounted idler pulley into one colored mesh", () => {
    const model = {
      nodes: {
        [PartName.mountedIdlerPulleyMount]: mesh(),
        [PartName.mountedIdlerPulleyLocknut]: mesh(),
        [PartName.mountedIdlerPulleyShim]: mesh(),
        [PartName.mountedIdlerPulleyBearing]: mesh(),
      },
      materials: {
        [MountedIdlerPulleyMaterial.mount]: material("gray"),
        [MountedIdlerPulleyMaterial.locknut]: material("silver"),
        [MountedIdlerPulleyMaterial.shim]: material("white"),
        [MountedIdlerPulleyMaterial.bearing]: material("black"),
      },
    } as unknown as MountedIdlerPulleyFull;

    const geometry = mountedIdlerPulleyGeometry(model);
    const { container } = render(<MountedIdlerPulleyModel model={model} />);

    expect(geometry?.getAttribute("color").count).toEqual(144);
    expect(mountedIdlerPulleyGeometry(model)).toBe(geometry);
    expect(container.querySelectorAll("mesh")).toHaveLength(1);
  });

  it("batches the v1.9 right bracket into one colored mesh", () => {
    const model = {
      nodes: {
        [PartName.gantryCornerBracketNutBar]: mesh(),
        [PartName.rightBracket]: mesh(),
      },
      materials: {
        [GantryCornerBracketMaterial.hardware]: material("silver"),
        [GantryCornerBracketMaterial.bracket]: material("gray"),
      },
    } as unknown as RightGantryCornerBracketFull;

    const geometry = rightGantryCornerBracketGeometry(model);
    const { container } = render(
      <RightGantryCornerBracketModel model={model} />,
    );

    expect(geometry?.getAttribute("color").count).toEqual(72);
    expect(rightGantryCornerBracketGeometry(model)).toBe(geometry);
    expect(container.querySelectorAll("mesh")).toHaveLength(1);
  });

  it("batches and culls the verified-closed seed trough holder", () => {
    const model = {
      nodes: {
        Seed_Trough_Holder_Mount_Plate: mesh(),
        M5_x_10mm_Screw: mesh(),
      },
      materials: {
        [SeedTroughHolderMaterial.zero]: material("gray"),
        [SeedTroughHolderMaterial.one]: material("silver"),
      },
    } as unknown as SeedTroughHolderFull;

    const { container } = render(<SeedTroughHolderModel model={model} />);
    const wrapper = createRenderer(<SeedTroughHolderModel model={model} />);
    const meshNode = wrapper.root.findAll(node =>
      (node.type as string) == "mesh")[0];

    expect(container.querySelectorAll("mesh")).toHaveLength(1);
    expect(meshNode.props.material.side).toEqual(THREE.FrontSide);
    unmountRenderer(wrapper);
  });
});
