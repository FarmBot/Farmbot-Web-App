import { actions } from './actions';
import { isFSA } from 'flux-standard-action';

export function reducer(state, action) {
  if (isFSA(action)) {
    console.log(action.type);
    console.dir(state);
    return (actions[action.type] || actions.DEFAULT)(state, action);
  } else {
    console.error("Action does not conform to 'flux-standard-action", action);
  }
  ;
}
;
