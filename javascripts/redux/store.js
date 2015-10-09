import { createStore, applyMiddleware } from 'redux';
import { reducer } from './reducer';
import thunk from 'redux-thunk';

var wrappedCreatedStore = applyMiddleware(thunk)(createStore);
var store = wrappedCreatedStore(reducer, window.initialState);

export { store };
