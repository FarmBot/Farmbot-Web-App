import { AuthState } from "./interfaces";
import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";

export const authReducer = generateReducer<AuthState | undefined>(undefined)
  .add<AuthState>(Actions.REPLACE_TOKEN, (_, { payload }) => {
    return payload;
  });
