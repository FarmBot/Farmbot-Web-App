import { BackArrow } from "../back_arrow";
import { mount } from "enzyme";

describe("<BackArrow />", () => {
  it("renders", () => {
    let element = mount(BackArrow());
    expect(element).toBeTruthy();
    expect(element.hasClass("back-arrow")).toBeTruthy();
    expect(element.find("i").at(0).hasClass("fa-arrow-left"))
      .toBeTruthy();
  });
});
