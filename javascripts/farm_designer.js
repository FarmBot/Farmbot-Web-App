import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { connect } from 'react-redux';
import { DesignerMain } from './menus/designer_main'
function wow (d) {
  return {d};
}
var App = connect(s => s, wow)(DesignerMain);

React.render(
  <Provider store={store}>
    {() => <App />}
  </Provider>,
  document.getElementById('root')
);
