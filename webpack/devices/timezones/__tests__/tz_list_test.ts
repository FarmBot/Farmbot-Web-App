import { list } from "../tz_list";

test("TZ List presence", () => {
  // Not the most useful test. Might catch accidental erasure, though.
  expect(list.length).toBe(588);
});
