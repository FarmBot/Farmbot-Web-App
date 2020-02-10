import { DeepPartial } from "redux";

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

type IMGEvent = React.SyntheticEvent<HTMLImageElement, Event>;
export const imgEvent = (): IMGEvent => {
  const event: DeepPartial<IMGEvent> = {
    currentTarget: {
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
    }
  };
  return event as IMGEvent;
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
