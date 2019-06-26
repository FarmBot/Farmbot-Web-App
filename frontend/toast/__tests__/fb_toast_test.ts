import { FBToast } from "../fb_toast";

describe("FBToast", () => {
  let count = 0;
  const newToast = (): [FBToast, HTMLDivElement] => {
    const parent = document.createElement("div");
    const child = new FBToast(parent, "title", "message" + (count++), "red");
    return [child, parent];
  };

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
    const fakeEvent: MouseEvent = {
      currentTarget: { children: [{}, {}, { children }] }
      // tslint:disable-next-line:no-any
    } as any;
    i.onEnter(fakeEvent);
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
    const fakeEvent: MouseEvent = {
      currentTarget: { children: [{}, {}, { children }] }
      // tslint:disable-next-line:no-any
    } as any;
    i.onLeave(fakeEvent);
    const playState = children.map(x => x.style.animationPlayState);
    expect(playState).toEqual(["running", "running", "running"]);
  });

  it("handles clicks", (done) => {
    const [i] = newToast();
    i.detach = jest.fn();
    const e =
      ({ currentTarget: { classList: { add: jest.fn() } } });
    // tslint:disable-next-line:no-any
    i.onClick(e as any);
    expect(e.currentTarget.classList.add).toHaveBeenCalledWith("poof");
    setTimeout(() => {
      expect(i.detach).toHaveBeenCalled();
      done();
    }, 200 * 1.1);
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
    i.detach();
    expect(FBToast.everyMessage[message]).toBeFalsy();
    expect(p.removeChild).toHaveBeenCalledWith(i.toastEl);
  });

});
