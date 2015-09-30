import React from 'react/addons';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { connect } from 'react-redux';
import { DesignerMain } from './menus/designer_main'
function wow (d) {
  return {dispatch: d};
}
var App = connect(s => s, wow)(DesignerMain);

React.render(
  <Provider store={store}>
    {() => <App />}
  </Provider>,
  document.getElementById('root')
);
