import { FBToast } from "../fb_toast";

describe("FBToast", () => {
  const parent = document.createElement("div");
  const newToast = () => new FBToast(parent, "title", "message", "red");

  it("instantiates", () => {
    const instance = newToast();

    expect(instance.leftLoaderEl.tagName).toEqual("DIV");
    expect(instance.loaderEl.tagName).toEqual("DIV");
    expect(instance.messageEl.tagName).toEqual("DIV");
    expect(instance.rightLoaderEl.tagName).toEqual("DIV");
    expect(instance.titleEl.tagName).toEqual("H4");
    expect(instance.toastEl.tagName).toEqual("DIV");
    expect(instance.spinnerLoaderEl.tagName).toEqual("DIV");
    expect(instance.isHovered).toEqual(false);
    expect(instance.intervalId).toEqual(0);
    expect(instance.message).toEqual("message");
    expect(instance.parent).toEqual(parent);
    expect(instance.timeout).toEqual(7);
  });

  it("handles mouse enter events", () => {
    const i = newToast();
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
});
