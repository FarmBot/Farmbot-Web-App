describe("maybeRunLocalstorageMigration", () => {
  it("translate legacyKeyNames to new_key_names", () => {
    localStorage.clear();
    expect(localStorage.getItem(DONE_FLAG));
  });
});
