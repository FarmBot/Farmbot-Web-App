import { DeepPartial } from "../redux/interfaces";

type DomEvent = React.SyntheticEvent<HTMLInputElement>;
export const inputEvent = (value: string, name?: string): DomEvent => {
  const event: DeepPartial<DomEvent> = { currentTarget: { value, name } };
  return event as DomEvent;
};

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;
export const changeEvent = (value: string): ChangeEvent => {
  const event: DeepPartial<ChangeEvent> = { currentTarget: { value } };
  return event as ChangeEvent;
};

type FormEvent = React.FormEvent<HTMLFormElement>;
export const formEvent = (): FormEvent => {
  const event: Partial<FormEvent> = { preventDefault: jest.fn() };
  return event as FormEvent;
};

type DragEvent = React.DragEvent<HTMLElement>;
export const dragEvent = (key: string): DragEvent => {
  const event: DeepPartial<DragEvent> = { dataTransfer: { getData: () => key } };
  return event as DragEvent;
};

type FocusEvent = React.FocusEvent<HTMLInputElement>;
export const focusEvent = (value: string): FocusEvent => {
  const event: DeepPartial<FocusEvent> = {
    target: { setSelectionRange: jest.fn(), value },
  };
  return event as FocusEvent;
};

type KeyboardEvent = React.KeyboardEvent<HTMLInputElement>;
export const keyboardEvent = (key: string): KeyboardEvent => {
  const event: DeepPartial<KeyboardEvent> = {
    key,
    currentTarget: { value: "" },
    preventDefault: jest.fn(),
  };
  return event as KeyboardEvent;
};
