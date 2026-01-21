import React from "react";

export const sameArrayByRef = <T>(left?: T[], right?: T[]) => {
  if (left === right) { return true; }
  if (!left || !right) { return false; }
  if (left.length !== right.length) { return false; }
  for (let i = 0; i < left.length; i++) {
    if (left[i] !== right[i]) { return false; }
  }
  return true;
};

export const useStableArray = <T>(items?: T[]) => {
  const ref = React.useRef<T[] | undefined>(items);
  if (!sameArrayByRef(ref.current, items)) {
    ref.current = items;
  }
  return ref.current;
};
