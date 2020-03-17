import {
  sortByNameAndPin, ButtonPin, getSpecialActionLabel,
} from "../list_and_label_support";
import { PinBindingSpecialAction } from "farmbot/dist/resources/api_resources";

describe("sortByNameAndPin()", () => {

  enum Order {
    firstSmaller = -1,
    secondSmaller = 1,
    equal = 0,
  }

  const btn1Pin = ButtonPin.estop;
  const btn2Pin = ButtonPin.unlock;

  const GPIO_SM = 4;
  const GPIO_LG = 18;

  const sortTest = (first: number, second: number, order: Order) =>
    expect(sortByNameAndPin(first, second)).toEqual(order);

  it("sorts", () => {
    sortTest(btn1Pin, 1, Order.firstSmaller); // Button 1 < GPIO 1
    sortTest(GPIO_SM, GPIO_LG, Order.firstSmaller); // GPIO SM < GPIO LG
    sortTest(GPIO_LG, GPIO_SM, Order.secondSmaller); // GPIO LG > GPIO SM
    sortTest(btn1Pin, btn2Pin, Order.firstSmaller); // Button 1 < Button 2
    sortTest(btn2Pin, btn1Pin, Order.secondSmaller); // Button 2 > Button 1
    sortTest(1, 1, Order.equal); // GPIO 1 == GPIO 1
  });
});

describe("getSpecialActionLabel()", () => {
  it("handles undefined values", () => {
    expect(getSpecialActionLabel(undefined)).toEqual("None");
    expect(getSpecialActionLabel("wrong" as PinBindingSpecialAction))
      .toEqual("");
  });
});
