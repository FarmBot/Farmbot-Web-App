import { ReactWrapper, ShallowWrapper } from "enzyme";
import { range } from "lodash";

/** Simulate a click and check button text for a button in a wrapper. */
export function clickButton(
  wrapper: ReactWrapper | ShallowWrapper,
  position: number,
  text: string,
  options?: { partial_match?: boolean, button_tag?: string }) {
  const btnTag = options && options.button_tag ? options.button_tag : "button";
  const button = wrapper.find(btnTag).at(position);
  const expectedText = text.toLowerCase();
  const actualText = button.text().toLowerCase();
  options && options.partial_match
    ? expect(actualText).toContain(expectedText)
    : expect(actualText).toEqual(expectedText);
  button.simulate("click");
}

/** Like `wrapper.text()`, but only includes buttons. */
export function allButtonText(wrapper: ReactWrapper | ShallowWrapper): string {
  const buttons = wrapper.find("button");
  const btnCount = buttons.length;
  const btnPositions = range(btnCount);
  const btnTextArray = btnPositions.map(position =>
    wrapper.find("button").at(position).text());
  return btnTextArray.join("");
}
