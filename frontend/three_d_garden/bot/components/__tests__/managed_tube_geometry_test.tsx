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
});
