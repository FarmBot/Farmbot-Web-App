//= require farmbot_app/react/init
//= require farmbot_app/react/menus/crop_inventory
//= require farmbot_app/react/menus/plant_catalog
//= require farmbot_app/react/menus/crop_info
//= require farmbot_app/react/menus/calendar
//= require farmbot_app/react/menus/schedule_creation
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';

class Crop {
  constructor(options) {
    this.name = (options.name || "Untitled Crop");
    this.age  = (options.age || _.random(0, 5));
    this._id  = (options._id || _.random(0, 1000));
    this.imgUrl = (options.imgUrl || "/designer_icons/unknown.svg");
  }
}

fakeCrops = [
  new Crop({name: "Blueberry", imgUrl: "/designer_icons/blueberry.svg"}),
  new Crop({name: "Cabbage", imgUrl: "/designer_icons/cabbage.svg"}),
  new Crop({name: "Pepper", imgUrl: "/designer_icons/pepper.svg"}),
  new Crop({name: "Cilantro", imgUrl: "/designer_icons/cilantro.svg"}),
];

Fb.ToolTip = React.createClass({
  render: function(){
    return(
      <div>
        <div className="fb-tooltip">
          <div className="tooltip-text">
            { this.props.desc }
          </div>
        </div>
        <span className={ (this.props.color || "") + " plus-circle" }
              onClick={ this.props.action }>
        </span>
      </div>
    );
  }
});

Fb.DesignerApp = class extends React.Component {
  render() {
    return <div className="farm-designer-body">
             <p>{Fb.store.getState().UI.inventoryTab}</p>
             <div className="farm-designer-left">
               <div id="designer-left">
                 { React.createElement(Fb.store.getState().UI.leftMenu) }
               </div>
             </div>

             <div className="farm-designer-middle">
               <div></div>
             </div>

             <div className="farm-designer-right">
               <div id="designer-right">
                 <Fb.Calendar />
               </div>
             </div>
           </div>

  }
}

Fb.wow = connect(s => s)(Fb.DesignerApp);

Fb.initialState = {
  UI: {
    leftMenu: Fb.Inventory.Content, // Left side of screen
    inventoryTab: 'Zones'           // Current tab selection in "Inventory"
  }
};

Fb.reducer = function(state, action) {
  if (action.type === "@@redux/INIT") {
    return state;
  } else {
    return(Fb.reducer[action.type] || Fb.reducer.UNKNOWN)(state, action.params);
  };
};

Fb.reducer.UNKNOWN = function(state, params) {
  console.warn("Unknown dispatcher");
  return state;
};

Fb.reducer.CLICK_INVENTORY_TAB = function(state, params) {
  return _.merge({}, state, {UI: {inventoryTab: params}});
};

Fb.store = createStore(Fb.reducer, Fb.initialState);

$(document).ready(function() {
  var dom = document.getElementById("farm-designer-app");
  var menu = (
    <Provider store={Fb.store}>
      {()=><Fb.wow/>}
    </Provider>);
  connect()(menu);
  if (dom){ React.render(menu, dom);
  } else{
    console.info('Not loading designer.');
  };
});

