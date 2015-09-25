let actions = {
  '@@redux/INIT': empty,
  DEFAULT: function (s, a) {
    console.warn("Unknown action fired.");
    console.trace();
    return s;
  },
  CATALOG_SHOW: function(s, a){
    return update(s, {leftMenu: {component: 'PlantCatalog'}});
  },
  INVENTORY_SHOW: function(s, a){
    console.log('!');
    return update(s, {leftMenu: {component: 'CropInventory'}});
  },
  INVENTORY_SHOW_TAB: function(s, a){
    return update(s, {});
  }
}

function empty(s, a) {
  return s;
};

function update(old_state, new_state) {
  return _.merge({}, old_state, new_state);
};

export { actions };
