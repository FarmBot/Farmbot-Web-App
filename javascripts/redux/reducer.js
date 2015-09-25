import { actions } from './actions';

export function reducer(state, action) {
  console.log(action.type)
  var action = (actions[action.type] || actions.DEFAULT);
  return action(state, action);
};
