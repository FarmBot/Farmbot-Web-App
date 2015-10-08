import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { connect } from 'react-redux';
import { DesignerMain } from './menus/designer_main';

function mapDispatchToProps(d) {
  return {
    dispatch: d
  };
}
var App = connect(state => state, mapDispatchToProps)(DesignerMain);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
