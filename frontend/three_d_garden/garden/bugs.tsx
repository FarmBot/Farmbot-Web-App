import React from "react";
import { Image } from "@react-three/drei";
import { DoubleSide, Material, Mesh as ThreeMesh } from "three";
import {
  BugAttack, useShowBugs,
} from "../../farm_designer/map/easter_eggs/bugs";
import { FilePath } from "../../internal_urls";

export interface ThreeDBugsProps {
  size: [number, number];
}

export const keepBugAboveSoil = (mesh: ThreeMesh | null) => {
  if (!mesh) { return; }
  const material = mesh.material as Material;
  material.polygonOffset = true;
  material.polygonOffsetFactor = -4;
  material.polygonOffsetUnits = -4;
};

export class ThreeDBugAttack extends BugAttack<ThreeDBugsProps> {
  get xMax() { return this.props.size[0]; }
  get yMax() { return this.props.size[1]; }

  render() {
    return <group name={"bugs"}>
      <React.Suspense>
        {this.state.bugs.map(bug =>
          <Image
            key={Object.values(bug).join("-")}
            name={`bug-${bug.id}`}
            ref={keepBugAboveSoil}
            url={FilePath.bug(bug.slug)}
            position={[
              bug.x - this.xMax / 2,
              bug.y - this.yMax / 2,
              1,
            ]}
            scale={[bug.r * 2, bug.r * 2]}
            frustumCulled={false}
            transparent={true}
            side={DoubleSide}
            grayscale={bug.alive ? 0 : 1}
            opacity={bug.hp / 100}
            onPointerDown={event => event.stopPropagation()}
            onPointerUp={event => event.stopPropagation()}
            onClick={event => {
              event.stopPropagation();
              this.onClick(bug.id);
            }} />)}
      </React.Suspense>
    </group>;
  }
}

export const ThreeDBugs = (props: ThreeDBugsProps) =>
  useShowBugs() ? <ThreeDBugAttack {...props} /> : <></>;
