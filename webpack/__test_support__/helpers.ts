import { ReactWrapper } from "enzyme";

// tslint:disable-next-line:no-any
export function getProp(i: ReactWrapper<any, {}>, key: string): any {
  return i.props()[key];
}
