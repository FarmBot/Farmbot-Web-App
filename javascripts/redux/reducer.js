import { actions } from './actions';

export function reducer(state, action) {
  console.log(action.type)
  return (actions[action.type] || actions.DEFAULT)(state, action);
};
