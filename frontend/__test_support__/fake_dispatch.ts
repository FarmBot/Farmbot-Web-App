import { Everything } from "../interfaces";

export const mockDispatch = (innerDispatch = jest.fn(),
  getState?: () => Everything | undefined) =>
  jest.fn(x => typeof x === "function" && x(innerDispatch, getState));
