import { createStore } from 'redux';
import { initialState } from './initial_state';
import { reducer } from './reducer';

var store = createStore(reducer, initialState);

export { store };
