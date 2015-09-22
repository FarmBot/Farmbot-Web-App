export function reducer(state, action) {
  if (action.type === "@@redux/INIT") {
    return state;
  } else {
    return(Fb.reducer[action.type] || Fb.reducer.UNKNOWN)(state, action.params);
  };
};

reducer.UNKNOWN = function(state, params) {
  console.warn("Unknown dispatcher");
  return state;
};

reducer.CLICK_INVENTORY_TAB = function(state, params) {
  return _.merge({}, state, {UI: {inventoryTab: params}});
};
