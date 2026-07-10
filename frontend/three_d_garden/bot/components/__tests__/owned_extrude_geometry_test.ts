import {
  BufferAttribute, BufferGeometry, ExtrudeGeometry, Shape,
} from "three";
import {
  millimetreGeometryKey, updateBufferGeometry, updateExtrudeGeometry,
} from "../owned_extrude_geometry";

describe("owned extrude geometry", () => {
  const geometry = (width: number) => {
    const shape = new Shape();
    shape.moveTo(0, 0);
    shape.lineTo(width, 0);
    shape.lineTo(width, 10);
    shape.lineTo(0, 10);
    shape.closePath();
    return new ExtrudeGeometry(shape, {
      bevelEnabled: false,
      depth: 5,
      steps: 1,
    });
  };

  it("updates vertex data without replacing the owned geometry", () => {
    const target = geometry(10);
    const source = geometry(20);
    const position = target.getAttribute("position") as BufferAttribute;
    const before = [...position.array];
    const beforeVersion = position.version;

    updateExtrudeGeometry(target, source);

    expect(target.getAttribute("position")).toBe(position);
    expect([...position.array]).not.toEqual(before);
    expect(position.version).toBeGreaterThan(beforeVersion);
    target.dispose();
    source.dispose();
  });

  it("uses millimetre precision for deformation keys", () => {
    expect(millimetreGeometryKey("x", 10.4)).toEqual("x:10");
    expect(millimetreGeometryKey("x", 10.6)).toEqual("x:11");
  });

  it("rejects incompatible geometry attributes", () => {
    const target = geometry(10);
    const missingAttribute = geometry(10);
    missingAttribute.deleteAttribute("normal");
    expect(() => updateBufferGeometry(target, missingAttribute))
      .toThrow("attribute topology changed");

    const differentCount = geometry(10);
    differentCount.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(3), 3),
    );
    expect(() => updateBufferGeometry(target, differentCount))
      .toThrow("position topology changed");
    target.dispose();
    missingAttribute.dispose();
    differentCount.dispose();
  });

  it("rejects incompatible geometry indexes", () => {
    const target = new BufferGeometry();
    const source = new BufferGeometry();
    const positions = new BufferAttribute(new Float32Array(9), 3);
    target.setAttribute("position", positions);
    source.setAttribute("position", positions.clone());
    target.setIndex([0, 1, 2]);

    expect(() => updateBufferGeometry(target, source))
      .toThrow("index topology changed");
    target.dispose();
    source.dispose();
  });
});
