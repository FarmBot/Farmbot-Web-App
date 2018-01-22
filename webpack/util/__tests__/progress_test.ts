import { Progress } from "../progress";

describe("Progress", () => {
  it("increments", () => {
    const cb = jest.fn();
    const counter = new Progress(3, cb);
    counter.inc();
    expect(cb).toHaveBeenCalledWith(counter);
    counter.inc();
    counter.inc(); // Now we're done.
    cb.mockClear();
    counter.inc();
    expect(cb).not.toHaveBeenCalled();
  });

  it("force finishes", () => {
    const cb = jest.fn();
    const counter = new Progress(3, cb);
    counter.finish();
    expect(cb).toHaveBeenCalled();
    expect(counter.isDone).toBeTruthy();
  });
});
