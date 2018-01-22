describe("doToggle()", () => {
  it("calls toggleWebAppBool, but isolated from its parent", () => {
    const dispatch = jest.fn();
    const toggler = doToggle(dispatch);
  });
});
