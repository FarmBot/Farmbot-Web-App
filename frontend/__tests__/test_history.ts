jest.mock("takeme", () => ({ navigate: jest.fn() }));
import { navigate } from "takeme";
import { push } from "../history";

describe("push()", () => {
  it("calls history with a URL", () => {
    push("/app/wow.html");
    expect(navigate).toHaveBeenCalledWith("/wow.html");
  });
});
