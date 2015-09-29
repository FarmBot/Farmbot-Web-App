//actually, these are 'action creators'.
import { store } from './store';
import { addons } from 'react/addons';

let actions = {
  '@@redux/INIT': empty,
  DEFAULT: function (s, a) {
    console.warn("Unknown action fired.");
    console.trace();
    return s;
  },
  CROP_ADD_REQUEST: function (s, a) {
    var req = $.ajax({method: "POST", url: "/api/crops", data: a.payload})
    .done(function (crop) {
      store.dispatch({type: "CROP_ADD_SUCCESS", payload: crop});
    })
    .fail(function (a, b, c) { store.dispatch({type: "CROP_ADD_FAILURE"}) });
    return s;
  },
  CROP_ADD_FAILURE: function (s = store.getState(), a) {
    alert("Failed to add crop, and also failed to write an error handler :(");
    return s;
  },
  CROP_ADD_SUCCESS: function (s = store.getState(), a) {
    var new_array = s.middleMenu.crops.concat(a.payload);
    return update(s, {middleMenu: {crops: new_array}});
  },
  CROP_INFO_SHOW: function(s, a) {
    // TODO: add type system to check for presence of `crop` Object?
    let fragment = {
      leftMenu: {
        component: 'CropInfo',
        crop: a.payload
      }
    };
    return update(s, fragment);
  },
  CATALOG_SHOW: function(s, a){
    return changeLeftComponent(s, 'PlantCatalog');
  },
  INVENTORY_SHOW: function(s, a){
    return changeLeftComponent(s, 'CropInventory');
  },
  INVENTORY_SHOW_TAB: function(s, a) {
    return update(s, {leftMenu: {tab: a.payload}});
  }
}

function empty(s, a) {
  return s;
};

function changeLeftComponent(state, name) {
  return update(state, {leftMenu: {component: name}});
};

function update(old_state, new_state) {
  return _.merge({}, old_state, new_state);
};

export { actions };
