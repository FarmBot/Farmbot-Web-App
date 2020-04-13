export const mockDispatch = (innerDispatch = jest.fn()) =>
  jest.fn(x => typeof x === "function" && x(innerDispatch));
