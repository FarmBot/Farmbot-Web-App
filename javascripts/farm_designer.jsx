import React from 'react';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { Content as LeftContent } from './menus/crop_inventory';
import { Calendar } from './menus/calendar'

// React component
class FarmDesigner extends React.Component {
  render(){
    return (
      <div className="farm-designer-body">
        <div className="farm-designer-left">
          <div id="designer-left">
            <LeftContent tab={this.props.leftMenu.tab}/>
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
function counter(state={count: 0}, action) {
  let count = state.count;
  switch(action.type){
    case 'increase':
      return {count: count+1};
    default:
      return state;
  }
}

var initialState = {
  leftMenu: {
    tab: 'Plants'
  },
  UI: {
    inventoryTab: 'Zones'           // Current tab selection in "Inventory"
  }
};

// Store:
let store = createStore(counter, initialState);

// Map Redux state to component props
function mapStateToProps(state)  { return state; };

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
  return {
    onIncreaseClick: () => dispatch(increaseAction)
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
