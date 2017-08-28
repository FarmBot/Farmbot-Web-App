import { history, push } from "../history";

describe("push()", () => {
  it("calls history with a URL", () => {
    const URL = "/wow.html";
    const oldFn = history.push;
    history.push = jest.fn();
    push(URL);
    expect(history.push).toHaveBeenCalledWith(URL);
    history.push = oldFn;
  });
});
