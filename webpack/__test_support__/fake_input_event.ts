import { DeepPartial } from "redux";

type DomEvent = React.SyntheticEvent<HTMLInputElement>;
export const inputEvent = (value: string): DomEvent => {
  const event: DeepPartial<DomEvent> = { currentTarget: { value } };
  return event as DomEvent;
};
