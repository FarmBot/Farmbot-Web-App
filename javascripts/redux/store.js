import { createStore } from 'redux';
import { reducer } from './reducer';

// var store = createStore(reducer, initialState);
var store = createStore(reducer, window.initialState);

export { store };
