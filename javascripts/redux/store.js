import { createStore, applyMiddleware } from 'redux';
import { reducer } from './reducer';
import thunk from 'redux-thunk';

// var store = createStore(reducer, window.initialState);
var store = applyMiddleware(thunk)
  (createStore)
  (reducer, window.initialState);
export { store };
