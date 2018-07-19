import { sortByNameAndPin, ButtonPin } from "../list_and_label_support";

describe("sortByNameAndPin()", () => {

  enum Order {
    firstSmaller = -1,
    secondSmaller = 1,
    equal = 0,
  }

  const btn1Pin = ButtonPin.estop;
  const btn2Pin = ButtonPin.unlock;

  const sortTest = (first: number, second: number, order: Order) =>
    expect(sortByNameAndPin(first, second)).toEqual(order);

  it("sorts", () => {
    sortTest(btn1Pin, 10, Order.firstSmaller); // Button 1 < GPIO 10
    sortTest(2, 10, Order.firstSmaller); // GPIO 2 < GPIO 10
    sortTest(btn1Pin, btn2Pin, Order.firstSmaller); // Button 1 < Button 2
    sortTest(btn2Pin, btn1Pin, Order.secondSmaller); // Button 2 > Button 1
    sortTest(1, 1, Order.equal); // GPIO 1 == GPIO 1
  });
});
