import { Flipper } from "../flipper";
import { times, noop } from "lodash";
describe("Flipper<T>", () => {
  type Item = { value: number };
  const items = (): Item[] => {
    return [
      { value: 0 },
      { value: 1 },
      { value: 2 },
    ];
  };

  it("goes up", () => {
    const f = new Flipper<Item>(items(), { value: -1 }, 0);
    expect(f.current.value).toBe(0);
    f.up((item, index) => {
      expect(index).toBe(1);
      expect(item && item.value).toBe(1);
    });
    times(3, () => f.up(noop));
    f.up((item, index) => {
      expect(index).toBe(2);
      expect(item && item.value).toBe(2);
    });
  });

  it("goes up and wraps", () => {
    const f = new Flipper<Item>(items(), { value: -1 }, 2);
    f.up((item, index) => {
      expect(index).toBe(0);
      expect(item && item.value).toBe(0);
    });
  });

  it("has a fallback", () => {
    const f = new Flipper<Item>([], { value: -1 }, 0);
    f.up((item, index) => {
      expect(index).toBe(0);
      expect(item && item.value).toBe(-1);
    });
  });

  it("goes down", () => {
    const f = new Flipper<Item>(items(), { value: -1 }, 2);
    expect(f.current.value).toBe(2);
    f.down((item, index) => {
      expect(index).toBe(1);
      expect(item && item.value).toBe(1);
    });
  });

  it("goes down and wraps", () => {
    const f = new Flipper<Item>(items(), { value: -1 }, 0);
    f.down((item, index) => {
      expect(index).toBe(2);
      expect(item && item.value).toBe(2);
    });
  });

});
