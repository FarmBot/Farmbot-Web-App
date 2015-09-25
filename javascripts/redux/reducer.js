import { actions } from './actions';

export function reducer(state, action) {
  var action = (actions[action.type] || actions.DEFAULT);
  return action(state, action);
};
