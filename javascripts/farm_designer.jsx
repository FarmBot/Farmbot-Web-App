import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { Crop, fakeCrops } from './crops.jsx';
import { Content } from './menus/crop_inventory';
import { reducer } from './reducer.jsx';
import { Calendar } from './menus/crop_inventory';
import { tooltip } from './tooltip';
import { designer_app } from './designer_app';


var store = createStore(reducer, {
  UI: {
    leftMenu: Content,    // Left side of screen
    inventoryTab: 'Zones' // Current tab selection in "Inventory"
  }
});

class Wut extends React.Component {
  render() {
    debugger;
    return <h1> Hello, world! </h1>; }
}

$(document).ready(function() {
  var wow = connect()(Wut);
  var dom = document.getElementById("farm-designer-app");
  var menu = (
    <Provider store={store}>
      { () => <wow/> }
    </Provider>);

  if (dom) {
    React.render(<Wut/>, dom);
  } else {
    console.info('Not loading designer.');
  };
});

