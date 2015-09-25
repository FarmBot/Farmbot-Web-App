import React from 'react';
import { Provider } from 'react-redux';
import { CropInventory } from './menus/crop_inventory';
import { PlantCatalog } from './menus/plant_catalog';
import { Calendar } from './menus/calendar';
import { store } from './redux/store';
import { connect } from 'react-redux';

// React component
class FarmDesigner extends React.Component {
  // Dynamically determine what to render on the left side of the designer,
  // based on the value of getStore().leftMenu.component
  renderPanel() {
    let {tab, component} = this.props.leftMenu;
    let dispatch = this.props.dispatch;
    let target = {CropInventory, PlantCatalog}[component];

    return React.createElement(target, {tab, dispatch});
  }
  render(){
    return (
      <div className="farm-designer-body">
        <div className="farm-designer-left">
          <div id="designer-left">
            { this.renderPanel() }
          </div>
        </div>

        <div className="farm-designer-middle">
          <div></div>
        </div>

        <div className="farm-designer-right">
          <div id="designer-right">
            <Calendar />
          </div>
        </div>
      </div>
    );
  }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
  return {
    dispatch: function(type, params = {}) {
      return dispatch(_.merge({type}, params))
    }
  }
 };

var App = connect(s => s, mapDispatchToProps)(FarmDesigner);

React.render(
  <Provider store={store}>
    {() => <App />}
  </Provider>,
  document.getElementById('root')
);
