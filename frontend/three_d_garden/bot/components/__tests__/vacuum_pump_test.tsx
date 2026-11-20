import React from "react";
import { render } from "@testing-library/react";
import { useGLTF } from "@react-three/drei";
import { CubicBezierCurve3, Vector3 } from "three";
import { INITIAL } from "../../../config";
import { ASSETS, LIB_DIR } from "../../../constants";
import { ColumnVacuumPump, createVacuumReturnPath } from "../vacuum_pump";
import { createColumnTubePath } from "../column_tube_path";

describe("<ColumnVacuumPump />", () => {
  beforeEach(() => {
    (useGLTF as unknown as jest.Mock).mockClear();
  });

  it.each([true, false])("joins the valve route after 60 mm with tracks=%s",
    tracks => {
      const config = { ...INITIAL, tracks };
      const shift = tracks ? 0 : 20;
      const bottom = config.columnLength - 327.454;
      const path = createVacuumReturnPath(config);
      const bend = path.curves[0] as CubicBezierCurve3;
      expect(bend.getTangent(0).z).toBeCloseTo(-1);
      expect(bend.getPoint(0)).toEqual(new Vector3(0, 0, 0));
      expect(bend.v1.z).toEqual(-25);
      expect(bend.v2.distanceTo(bend.v3)).toBeCloseTo(25, 3);
      const valve = createColumnTubePath({
        end: [-31.105, 76 + config.bedYOffset - shift,
          config.columnLength + 30.5],
        columnOffset: [-4.105, 26 - shift],
        faceOffset: [-44.105, 46],
        endControl: [0, -25, 0],
      });
      const pumpOrigin = new Vector3(-38.925,
        shift - config.bedYOffset + 35.5, bottom - 75);
      const valveOrigin = new Vector3(-28.895,
        shift - config.bedYOffset - 41, 59.5);
      const first = valve.curves[0];
      const splitT = first.getUtoTmapping(0, 60);
      const expectedJoin = first.getPoint(splitT).add(valveOrigin)
        .add(new Vector3(12, 0, 0));
      const actualJoin = bend.getPoint(1).add(pumpOrigin);
      expect(actualJoin.distanceTo(expectedJoin)).toBeLessThan(0.001);
      expect(bend.getTangent(1).dot(first.getTangent(splitT)))
        .toBeCloseTo(1, 3);
      valve.curves.forEach((curve, index) => {
        for (const t of [0, 0.25, 0.5, 0.75, 1]) {
          const pumpPoint = path.curves[index + 1].getPoint(t).add(pumpOrigin);
          const valveT = index == 0 ? splitT + (1 - splitT) * t : t;
          const valvePoint = curve.getPoint(valveT).add(valveOrigin);
          expect(pumpPoint.x - valvePoint.x).toBeCloseTo(12, 3);
          expect(pumpPoint.y).toBeCloseTo(valvePoint.y, 3);
          expect(pumpPoint.z).toBeCloseTo(valvePoint.z, 3);
        }
      });
    },
  );

  it.each([
    [500, true],
    [650, false],
  ] as const)(
    "mounts on the column with columnLength=%s and tracks=%s",
    (columnLength, tracks) => {
      const config = { ...INITIAL, columnLength, tracks };
      const { container, rerender } = render(
        <ColumnVacuumPump config={config} />,
      );
      const root = container.querySelector("[name='column-vacuum-pump']")!;
      const bottom = columnLength - 190 - 137.454;
      const columnY = (tracks ? 0 : 20) - config.bedYOffset - 10;
      expect(root).toHaveAttribute(
        "position", `-108,${columnY},${bottom}`,
      );
      expect(root).toHaveAttribute("rotation", `0,0,${Math.PI / 2}`);
      const housing = container.querySelector("[name='vacuumPumpHousing']")!;
      const housingZ = Number(housing.getAttribute("position")!.split(",")[2]);
      // Cover mesh starts at Z=0, offset by -255 inside its model component.
      expect(bottom + housingZ - 255).toBeCloseTo(bottom, 3);
      expect(container.querySelector("[name='vacuumPump']"))
        .toHaveAttribute("position", "-45,-8,-195");
      expect(container.querySelector("[name='vacuum-return-tube']"))
        .toHaveAttribute("position",
          `-38.925,${(tracks ? 0 : 20) - config.bedYOffset + 35.5},${bottom - 75}`);
      expect(useGLTF).toHaveBeenCalledWith(ASSETS.models.vacuumPumpV19, LIB_DIR);
      expect(useGLTF).not.toHaveBeenCalledWith(ASSETS.models.vacuumPump, LIB_DIR);
      expect(useGLTF).toHaveBeenCalledWith(ASSETS.models.vacuumPumpCover, LIB_DIR);
      rerender(<ColumnVacuumPump config={{ ...config, columnLength: 700 }} />);
      expect(root).toHaveAttribute(
        "position", `-108,${columnY},${700 - 327.454}`,
      );
    },
  );
});
