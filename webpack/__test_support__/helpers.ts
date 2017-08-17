import { ReactWrapper } from "enzyme";

export function getProp(i: ReactWrapper<any, {}>, key: string): any {
  return i.props()[key];
}
