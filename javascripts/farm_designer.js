import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { connect } from 'react-redux';
import { DesignerMain } from './menus/designer_main'

function mapDispatchToProps(dispatch) {
  return {
    dispatch: function(type, params = {}) {
      return dispatch(_.merge({type}, params))
    }
  }
 };

var App = connect(s => s, mapDispatchToProps)(DesignerMain);

React.render(
  <Provider store={store}>
    {() => <App />}
  </Provider>,
  document.getElementById('root')
);
