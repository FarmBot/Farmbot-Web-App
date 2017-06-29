import { WD_ENV } from "./remote_env/interfaces";

export interface SettingsMenuProps {
  values: Partial<WD_ENV>;
  onChange(key: keyof WD_ENV, value: number): void;
}
