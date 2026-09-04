import { events } from "@react-three/fiber";
import { safePointerEvents } from "../pointer_events";

describe("safePointerEvents()", () => {
  const pointerEvent = (type: string, pointerId: number) =>
    Object.assign(new Event(type, { bubbles: true }), { pointerId });

  it("ignores a missing event target", () => {
    const connect = jest.fn();
    (events as jest.Mock).mockReturnValueOnce({
      enabled: true,
      priority: 1,
      connect,
    });
    const manager = safePointerEvents({} as never);

    // eslint-disable-next-line no-null/no-null
    manager.connect?.(null as never);
    expect(connect).not.toHaveBeenCalled();

    const target = document.createElement("div");
    manager.connect?.(target);
    expect(connect).toHaveBeenCalledWith(target);
  });

  it("preserves event managers without a connect handler", () => {
    const eventManager = { enabled: true, priority: 1 };
    (events as jest.Mock).mockReturnValueOnce(eventManager);

    expect(safePointerEvents({} as never)).toBe(eventManager);
  });

  it("ignores duplicate active pointer IDs", () => {
    const eventManager = {
      enabled: true,
      priority: 1,
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    (events as jest.Mock).mockReturnValueOnce(eventManager);
    const manager = safePointerEvents({} as never);
    const target = document.createElement("div");
    const pointerDown = jest.fn();
    target.addEventListener("pointerdown", pointerDown);
    manager.connect?.(target);

    target.dispatchEvent(pointerEvent("pointerdown", 1));
    target.dispatchEvent(pointerEvent("pointerdown", 1));
    expect(pointerDown).toHaveBeenCalledTimes(1);

    document.dispatchEvent(pointerEvent("pointerup", 1));
    target.dispatchEvent(pointerEvent("pointerdown", 1));
    expect(pointerDown).toHaveBeenCalledTimes(2);

    document.dispatchEvent(pointerEvent("pointercancel", 1));
    target.dispatchEvent(pointerEvent("pointerdown", 1));
    expect(pointerDown).toHaveBeenCalledTimes(3);

    manager.disconnect?.();
    expect(eventManager.disconnect).toHaveBeenCalled();
    target.dispatchEvent(pointerEvent("pointerdown", 1));
    expect(pointerDown).toHaveBeenCalledTimes(4);
  });
});
