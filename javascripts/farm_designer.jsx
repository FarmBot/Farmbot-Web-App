import React from 'react';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { Content as LeftContent } from './menus/crop_inventory';
import { PlantCatalog } from './menus/plant_catalog'
import { Calendar } from './menus/calendar'

// React component
class FarmDesigner extends React.Component {
  renderPanel() {
    let {tab, component} = this.props.leftMenu;
    let components = {LeftContent, PlantCatalog};
    let showCatalog = this.props.showCatalog;
    let target = components[component];

    return React.createElement(target, {tab, showCatalog});
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

// Action:
const increaseAction = {type: 'increase'};

// Reducer:
function reducer(state, action) {
  switch(action.type){
    case 'RENDER_CATALOG':
      return _.merge({}, state, {leftMenu: {component: 'PlantCatalog'}});
    default:
      return state;
  }
}

var initialState = {
  leftMenu: {
    component: 'LeftContent',
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
    showCatalog: (tabName) => dispatch({type: "RENDER_CATALOG", tab: tabName})
  };
}

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
