import React from 'react';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { CropInventory } from './menus/crop_inventory';
import { PlantCatalog } from './menus/plant_catalog'
import { Calendar } from './menus/calendar'

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

// Reducer:
function reducer(state, action) {
  var replace = function(new_state) {
    return _.merge({}, state, new_state);
  };
  switch(action.type){
    case 'SHOW_CATALOG':
      return replace({leftMenu: {component: 'PlantCatalog'}});
    case 'SHOW_INVENTORY':
      return replace({leftMenu: {component: 'PlantCatalog'}})
    default:
      return state;
  }
}

var initialState = {
  leftMenu: {
    component: 'CropInventory',
    tab: 'Plants'
  }
};

// Store:
let store = createStore(reducer, initialState);

// Map Redux state to component props
function mapStateToProps(state)  { return state; };

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
  return {
    dispatch: function(type, params = {}) {
      return dispatch(_.merge({type}, params))
    }
  }
 };

// Connected Component:
let App = connect(
  mapStateToProps,
  mapDispatchToProps
)(FarmDesigner);

React.render(
  <Provider store={store}>
    {() => <App />}
  </Provider>,
  document.getElementById('root')
);
