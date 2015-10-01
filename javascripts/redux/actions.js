//actually, these are 'action creators'.
import { store } from './store';
import { addons } from 'react/addons';

let actions = {};

actions['@@redux/INIT'] = empty;

actions.DEFAULT = function (s, a) {
  console.warn("Unknown action fired.");
  console.trace();
  return s;
};

actions.CROP_SELECT = function(s, a) {
  var select_crop = update(s, {global: {selectedPlant: a.payload}});
  var change_menu = actions.CROP_INFO_SHOW(select_crop, a);
  return _.merge({}, select_crop, change_menu);
};

actions.CROP_ADD_REQUEST = function (s, a) {
  // TODO: Add some sort of Redux Async handler.
  $.ajax({method: "POST", url: "/api/plants", data: a.payload})
  .fail(function (a, b, c) {
    alert("Failed to add crop. Refresh page.");
  });
  var plants = _.cloneDeep(s.global.plants);
  var selectedPlant  = _.cloneDeep(a.payload);
  plants.push(selectedPlant);
  return update(s, {
    global: {
      plants: plants,
      selectedPlant: selectedPlant
    }
  });
};

actions.CROP_REMOVE_REQUEST = function (s, a) {
  $.ajax({method: "DELETE", url: "/api/plants/" + a.payload._id })
  .fail(() => alert("Failed to delete. Refresh the page."));
  var plants = _.filter(_.cloneDeep(s.global.plants),
               (p) => p._id == a.payload._id);
  return update(s, {
    global: {
      plants: plants
    }
  });

  return update(s, {global: {plants: plants}});
};

actions.CROP_REMOVE_FAILURE = function (s = store.getState(), a) {
  alert("Failed to remove crop.");
  return s;
};

// actions.CROP_REMOVE_SUCCESS = function (s = store.getState(), a) {
//   return update(s, {
//     global: {
//       plants: _.filter(s.global.plants, a.payload)
//     }
//   });
// };

actions.PLANT_INFO_SHOW = function(s, a) {
  // TODO: add type system to check for presence of `crop` Object?
  let fragment = {
    leftMenu: {
      component: 'PlantInfo',
      plant: a.payload
    }
  };
  return update(s, fragment);
};

actions.CROP_INFO_SHOW = function(s, a) {
  // TODO: add type system to check for presence of `crop` Object?
  return update(s, {
      leftMenu: {
        component: 'CropInfo',
        plant: a.payload
      }
    });
};

actions.CATALOG_SHOW = function(s, a){
  return changeLeftComponent(s, 'PlantCatalog');
};

actions.INVENTORY_SHOW = function(s, a){
  return changeLeftComponent(s, 'PlantInventory');
};

actions.INVENTORY_SHOW_TAB = function(s, a) {
  return update(s, {leftMenu: {tab: a.payload}});
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
