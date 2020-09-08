import { FBToast } from "../fb_toast";

describe("FBToast", () => {
  let count = 0;
  const newToast = (idPrefix = ""): [FBToast, HTMLDivElement] => {
    const parent = document.createElement("div");
    const child =
      new FBToast(parent, "title", "message" + (count++), "red", idPrefix, false);
    parent.appendChild(child.toastEl);
    return [child, parent];
  };

  const mouseEvent = (
    children?: { style: Partial<CSSStyleDeclaration> }[],
    add = jest.fn(),
  ): MouseEvent => ({
    currentTarget: { children: [{}, {}, { children }], classList: { add } }
  }) as unknown as MouseEvent;

  it("instantiates", () => {
    const [instance, parent] = newToast();

    expect(instance.leftLoaderEl.tagName).toEqual("DIV");
    expect(instance.loaderEl.tagName).toEqual("DIV");
    expect(instance.messageEl.tagName).toEqual("DIV");
    expect(instance.rightLoaderEl.tagName).toEqual("DIV");
    expect(instance.titleEl.tagName).toEqual("H4");
    expect(instance.toastEl.tagName).toEqual("DIV");
    expect(instance.spinnerLoaderEl.tagName).toEqual("DIV");
    expect(instance.isHovered).toEqual(false);
    expect(instance.intervalId).toEqual(0);
    expect(instance.message).toEqual(("message" + (count - 1)));
    expect(instance.parent).toEqual(parent);
    expect(instance.timeout).toEqual(7);
  });

  it("handles mouse enter events", () => {
    const [i] = newToast();
    i.isHovered = false;
    const children = [
      { style: { animationPlayState: "X" } },
      { style: { animationPlayState: "Y" } },
      { style: { animationPlayState: "Z" } },
    ];
    i.onEnter(mouseEvent(children));
    const playState = children.map(x => x.style.animationPlayState);
    expect(playState).toEqual(["paused", "paused", "paused"]);
  });

  it("handles mouse leave events", () => {
    const [i] = newToast();
    i.isHovered = false;
    const children = [
      { style: { animationPlayState: "X" } },
      { style: { animationPlayState: "Y" } },
      { style: { animationPlayState: "Z" } },
    ];
    i.onLeave(mouseEvent(children));
    const playState = children.map(x => x.style.animationPlayState);
    expect(playState).toEqual(["running", "running", "running"]);
  });

  it("handles clicks", () => {
    jest.useFakeTimers();
    const [i] = newToast();
    i.detach = jest.fn();
    const add = jest.fn();
    i.onClick(mouseEvent([], add));
    jest.advanceTimersByTime(200 * 1.1);
    expect(add).toHaveBeenCalledWith("poof");
    expect(i.detach).toHaveBeenCalled();
  });

  it("attaches to the DOM", () => {
    const [i, p] = newToast();
    p.appendChild = jest.fn();
    i.run();
    expect(p.appendChild).toHaveBeenCalledWith(i.toastEl);
    expect(i.intervalId).not.toBe(0);
  });

  it("detaches from the DOM", () => {
    const [i, p] = newToast();
    const { message } = i;
    FBToast.everyMessage[message] = true;
    p.removeChild = jest.fn();
    i.isAttached = true;
    i.detach();
    expect(FBToast.everyMessage[message]).toBeFalsy();
    expect(p.removeChild).toHaveBeenCalledWith(i.toastEl);
    expect(i.isAttached).toBeFalsy();
  });

  it("doesn't detach from the DOM", () => {
    const [i, p] = newToast();
    p.innerHTML = "";
    const { message } = i;
    FBToast.everyMessage[message] = true;
    p.removeChild = jest.fn();
    i.isAttached = true;
    i.detach();
    expect(FBToast.everyMessage[message]).toBeFalsy();
    expect(p.removeChild).not.toHaveBeenCalled();
    expect(i.isAttached).toBeTruthy();
  });

  it("sets id", () => {
    const toast = newToast("id-prefix")[0];
    expect(toast.toastEl.id).toEqual(expect.stringMatching("^id-prefix-toast-"));
  });

  it("doesn't set id", () => {
    const toast = newToast()[0];
    expect(toast.toastEl.id).toEqual("");
  });

  it("does polling", () => {
    const [i] = newToast();
    i.isHovered = false;
    i.timeout = 0;
    i.detach = jest.fn();
    i.doPolling();
    expect(i.detach).toHaveBeenCalled();
  });

  it("does polling: large timeout value", () => {
    const [i] = newToast();
    i.isHovered = false;
    i.timeout = 8;
    i.detach = jest.fn();
    i.doPolling();
    expect(i.detach).not.toHaveBeenCalled();
  });

  it("does polling: hovered", () => {
    const [i] = newToast();
    i.isHovered = true;
    i.timeout = 0;
    i.detach = jest.fn();
    i.doPolling();
    expect(i.detach).not.toHaveBeenCalled();
  });

  it("run: does polling", () => {
    const [i, parent] = newToast();
    i.parent = parent;
    i.isAttached = false;
    i.noTimer = false;
    i.intervalId = 0;
    i.run();
    expect(i.toastEl.className).not.toContain("no-timer");
    expect(i.isAttached).toEqual(true);
    expect(i.intervalId).not.toEqual(0);
  });

  it("run: doesn't do polling", () => {
    const [i, parent] = newToast();
    i.parent = parent;
    i.isAttached = false;
    i.noTimer = true;
    i.intervalId = 0;
    i.run();
    expect(i.toastEl.className).toContain("no-timer");
    expect(i.isAttached).toEqual(true);
    expect(i.intervalId).toEqual(0);
  });
});
