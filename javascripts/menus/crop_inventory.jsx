Fb.Inventory = {}

Fb.Inventory.Tab = class extends React.Component {
  render() {
    return <li onClick={ this.handleClick.bind(this) }>
            <a href="#"
               wow={this.store}
               className={this.props.active ? "active" : ""}>
              { this.props.name }
            </a>
           </li>
  }

  handleClick() {
    debugger;
    Fb.store.dispatch({type: "CLICK_INVENTORY_TAB", params: this.props.name})
  }
}


Fb.Inventory.Plants = class extends React.Component {
  render() {
    return(
      <div>
        <Fb.Inventory.List crops={ fakeCrops } />
        <Fb.ToolTip action={ Fb.renderCatalog } desc="Add a new plant" color="dark-green"/>
      </div>
    );
  }
};

Fb.Inventory.Groups = class extends React.Component {
  render() {
    return(
      <div className="designer-info">
        <h6>My Groups</h6>
        <ul>
          <li>
            <a href="#">Lucky Cabages</a>
            <p>5 Plants</p>
          </li>
          <li>
            <a href="#">Lucky Cabages</a>
            <p>5 Plants</p>
          </li>
        </ul>
        <h6>Zone Auto-Groups</h6>
        <ul>
          <li>
            <a href="#">Plants in "Broccoli Overlord"</a>
            <p>10 Plants</p>
          </li>
          <li>
            <a href="#">Plants in "Flower Patch"</a>
            <p>7 Plants</p>
          </li>
        </ul>
        <h6>Crop Auto-Groups</h6>
        <ul>
          <li>
            <a href="#">All Strawberries</a>
            <p>1 plant</p>
          </li>
          <li>
            <a href="#">All Flowers</a>
            <p>42 plants</p>
          </li>
        </ul>
        <Fb.ToolTip action={ Fb.renderCatalog }
                    desc="Add a new group"
                    color="dark-green"/>
      </div>
    )
  }
};

Fb.Inventory.Zones = class extends React.Component {
  render() {
    return(
      <div className="designer-info">
        <h6>My Zones</h6>
        <ul>
          <li>
            <a href="#">Front area</a>
            <p>18 Square Feet</p>
          </li>
          <li>
            <a href="#">Needs Compost</a>
            <p>5 Square Feet</p>
          </li>
        </ul>
        <h6>Auto-Zones</h6>
        <ul>
          <li>
            <a href="#">Broccoli Overlord</a>
            <p>60 Square Feet</p>
          </li>
        </ul>
        <Fb.ToolTip action={ Fb.renderCatalog }
                    desc="Add New Zone"
                    color="dark-green"/>
      </div>
    )
  }
};
Fb.Inventory.Item = class extends React.Component {
  render() {
    return(
      <li>
        <a href="#"> {this.props.crop.name} </a>
        <div>{this.props.crop.age} days old</div>
      </li>);
  }
};

Fb.Inventory.List = class extends React.Component {
  render() {
    var crops = this.props.crops.map(
       (crop, k) => <Fb.Inventory.Item crop={crop} key={ k } />
     );

    return(<ul className="crop-inventory"> { crops } </ul>);
  }
};

Fb.Inventory.Content = class extends React.Component {

  get tabName() {
    return (Fb.store.getState().UI.inventoryTab || "Plants")
  }

  currentTab() { return Fb.Inventory[this.tabName] }

  isActive(item) { return this.tabName === item }

  render() {
    return (
      <div>
        <div className="green-content">
          <div className="search-box-wrapper">
            <input className="search" placeholder="Search"/>
          </div>
          <ul className="tabs">
            {
              ["Plants", "Groups", "Zones"].map(function(item, i) {
                return <Fb.Inventory.Tab key={i}
                                        name={item}
                                        active={this.isActive(item)}/>;
            }.bind(this))}
          </ul>
        </div>

        {
          React.createElement(this.currentTab())
        }
      </div>
    )
  }
};


Fb.renderInventory = function(){
  React.render(<Fb.Inventory.Content />, Fb.leftMenu);
};
