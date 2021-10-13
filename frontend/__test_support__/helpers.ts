import { ReactWrapper, shallow, ShallowWrapper } from "enzyme";
import { range } from "lodash";

/** Simulate a click and check button text for a button in a wrapper. */
export function clickButton(
  wrapper: ReactWrapper | ShallowWrapper,
  position: number,
  text: string,
  options?: { partial_match?: boolean, icon?: string }) {
  const button = wrapper.find("button").at(position);
  const expectedText = text.toLowerCase();
  const actualText = button.text().toLowerCase();
  options?.partial_match
    ? expect(actualText).toContain(expectedText)
    : expect(actualText).toEqual(expectedText);
  options?.icon && expect(button.html()).toContain(options.icon);
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

/** Simulate BlurableInput commit (when not using shallow). */
export function changeBlurableInput(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrapper: ReactWrapper<any>,
  value: string,
  position = 0,
) {
  const input = shallow(wrapper.find("input").at(position).getElement());
  input.simulate("change", { currentTarget: { value } });
  input.simulate("blur", { currentTarget: { value } });
}
