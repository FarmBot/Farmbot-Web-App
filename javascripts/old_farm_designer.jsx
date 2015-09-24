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
  wow() { debugger; }
  render() {
    return <div>
    <h1> Hello, world! </h1>
    <button onClick={ this.wow.bind(this) } > Click 3 { this.props.value } </button>
    </div>;
  }
}

// $(document).ready(function() {
//   var wow = connect(function(a,b,c){debugger})(Wut);
//   // if (dom) {

//     React.render(
//       <Provider store={store}>
//         { () => <wow/> }
//       </Provider>,
//       document.getElementById("farm-designer-app"));
//   // } else {
//   //   console.info('Not loading designer.');
//   // };
// });

