let actions = {
  '@@redux/INIT': empty,
  DEFAULT: function (s, a) {
    console.warn("Unknown action fired.");
    console.trace();
    return s;
  },
  CROP_INFO_SHOW: function(s, a) {
    // TODO: add type system to check for presence of `crop` Object?
    let fragment = {
      leftMenu: {
        component: 'CropInfo',
        crop: a.crop
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
    return update(s, {leftMenu: {tab: a.tab}});
  },
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
