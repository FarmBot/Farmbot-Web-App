import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { Crop, fakeCrops } from './crops';
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
