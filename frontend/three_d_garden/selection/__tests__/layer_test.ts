import { clearPendingSelectionLayerAnimation } from "../layer";

describe("selection layer", () => {
  it("clears pending animation work", () => {
    const clearTimeout = jest.spyOn(window, "clearTimeout")
      .mockImplementation(jest.fn());
    const cancelAnimationFrame = jest.spyOn(window, "cancelAnimationFrame")
      .mockImplementation(jest.fn());

    clearPendingSelectionLayerAnimation([1], [2]);

    expect(clearTimeout).toHaveBeenCalledWith(1);
    expect(cancelAnimationFrame).toHaveBeenCalledWith(2);
    clearTimeout.mockRestore();
    cancelAnimationFrame.mockRestore();
  });
});
