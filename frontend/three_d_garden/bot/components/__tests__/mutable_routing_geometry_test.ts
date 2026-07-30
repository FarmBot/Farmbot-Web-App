import { BufferAttribute, Shape } from "three";
import { buildXAxisBeltPath } from "../../belts";
import { BeltPath } from "../../belt_path";
import { buildCableCarrierShape } from "../cable_carriers";
import {
  MutableBeltGeometry, MutableCarrierGeometry,
} from "../mutable_routing_geometry";

const values = (attribute: BufferAttribute) => [...attribute.array];

describe("mutable routing geometry", () => {
  it("updates a carrier without replacing its vertex buffer", () => {
    const initial = buildCableCarrierShape(1000, 100, 70);
    const geometry = new MutableCarrierGeometry(initial, 20);
    const position = geometry.getAttribute("position") as BufferAttribute;
    const before = values(position);

    geometry.update(buildCableCarrierShape(1000, 500, 70));

    expect(geometry.getAttribute("position")).toBe(position);
    expect(values(position)).not.toEqual(before);
    expect(values(position).every(Number.isFinite)).toBeTruthy();
    geometry.dispose();
  });

  it("updates a belt without replacing its high-resolution buffer", () => {
    const geometry = new MutableBeltGeometry(
      buildXAxisBeltPath("v1.9", 500, 2987, 300),
    );
    const position = geometry.getAttribute("position") as BufferAttribute;
    const before = values(position);

    geometry.update(buildXAxisBeltPath("v1.9", 500, 2987, 1300));

    expect(geometry.getAttribute("position")).toBe(position);
    expect(position.count).toBeGreaterThan(500);
    expect(values(position)).not.toEqual(before);
    expect(values(position).every(Number.isFinite)).toBeTruthy();
    geometry.dispose();
  });

  it("rejects carrier and belt topology changes", () => {
    const shape = new Shape();
    shape.moveTo(0, 0);
    shape.lineTo(10, 0);
    shape.lineTo(10, 10);
    shape.closePath();
    const carrier = new MutableCarrierGeometry(shape, 5);
    const changedShape = shape.clone();
    changedShape.lineTo(0, 5);
    expect(() => carrier.update(changedShape)).toThrow("topology changed");
    carrier.dispose();

    const belt = new MutableBeltGeometry(
      buildXAxisBeltPath("v1.9", 500, 2987, 300),
    );
    const changedBelt = new BeltPath()
      .start(0, 0, 0)
      .pulley(100, 0, 0, 20, -1)
      .end(200, 0, 0);
    expect(() => belt.update(changedBelt)).toThrow("topology changed");
    belt.dispose();
  });
});
