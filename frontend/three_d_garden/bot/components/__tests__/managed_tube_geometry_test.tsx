import { renderHook } from "@testing-library/react";
import { TubeGeometry } from "three";
import { easyCubicBezierCurve3 } from "../../../helpers";
import { useManagedTubeGeometry } from "../managed_tube_geometry";

describe("useManagedTubeGeometry()", () => {
  const path = (end: number) => easyCubicBezierCurve3(
    [0, 0, 0],
    [0, 0, 1],
    [0, 0, -1],
    [end, 0, 10],
  );

  it("reuses geometry and disposes each owned instance once", () => {
    const disposeSpy = jest.spyOn(TubeGeometry.prototype, "dispose");
    const initialPath = path(1);
    const { result, rerender, unmount } = renderHook(
      ({ tubePath }) => useManagedTubeGeometry(
        tubePath,
        8,
        1,
        6,
        "test.tube",
      ),
      { initialProps: { tubePath: initialPath } },
    );
    const initialGeometry = result.current;

    rerender({ tubePath: initialPath });
    expect(result.current).toBe(initialGeometry);
    expect(disposeSpy).not.toHaveBeenCalled();

    rerender({ tubePath: path(2) });
    expect(result.current).toBe(initialGeometry);
    expect(disposeSpy).toHaveBeenCalledTimes(1);

    unmount();
    expect(disposeSpy).toHaveBeenCalledTimes(2);
    disposeSpy.mockRestore();
  });

  it.each([
    { tubularSegments: 20, radialSegments: 8 },
    { tubularSegments: 100, radialSegments: 6 },
    { tubularSegments: 120, radialSegments: 8 },
    { tubularSegments: 100, radialSegments: 10 },
  ])("replaces geometry when segment counts change: %j", segments => {
    const initialPath = path(1);
    const { result, rerender, unmount } = renderHook(
      ({ tubePath, tubularSegments, radialSegments, radius }) =>
        useManagedTubeGeometry(
          tubePath, tubularSegments, radius, radialSegments, "test.tube",
        ),
      { initialProps: {
        tubePath: initialPath,
        tubularSegments: 100,
        radialSegments: 8,
        radius: 1,
      } },
    );
    const initialGeometry = result.current;
    const initialDispose = jest.spyOn(initialGeometry, "dispose");
    expect(initialGeometry.getAttribute("position").count).toEqual(909);

    const nextProps = { tubePath: path(2), radius: 2, ...segments };
    rerender(nextProps);
    const replacement = result.current;
    const replacementDispose = jest.spyOn(replacement, "dispose");
    const expected = new TubeGeometry(
      nextProps.tubePath, segments.tubularSegments,
      nextProps.radius, segments.radialSegments,
    );
    expect(replacement).not.toBe(initialGeometry);
    expect(initialDispose).toHaveBeenCalledTimes(1);
    expect(replacement.getAttribute("position").array)
      .toEqual(expected.getAttribute("position").array);
    expect(replacement.index?.array).toEqual(expected.index?.array);
    expected.dispose();

    const position = replacement.getAttribute("position");
    rerender({ ...nextProps, tubePath: path(3), radius: 3 });
    expect(result.current).toBe(replacement);
    expect(replacement.getAttribute("position")).toBe(position);
    expect(position.array).not.toEqual(expected.getAttribute("position").array);
    expect(replacementDispose).not.toHaveBeenCalled();

    unmount();
    expect(initialDispose).toHaveBeenCalledTimes(1);
    expect(replacementDispose).toHaveBeenCalledTimes(1);
    initialDispose.mockRestore();
    replacementDispose.mockRestore();
  });
});
