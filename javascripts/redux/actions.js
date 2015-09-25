let actions = {
  DEFAULT: function(s, a){ return s; },
  SHOW_CATALOG: function(s, a){
    return replace(s, {leftMenu: {component: 'PlantCatalog'}});
  },
  SHOW_INVENTORY: function(s, a){
    console.log('!');
    return replace(s, {leftMenu: {component: 'CropInventory'}});
  }
}

function replace(old_state, new_state) {
  return _.merge({}, old_state, new_state);
};

export { actions };
