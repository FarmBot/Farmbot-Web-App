Fb.InventoryTab = class extends React.Component {
  render() {
    return <li onClick={ this.handleClick.bind(this) }>
            <a href="#"
               className={this.props.active ? "active" : ""}>
              { this.props.name }
            </a>
           </li>
  }

  handleClick(a,b,c,d){
    var that = this.props.fml;
    var name = this.props.name;
    that.setState({current_tab: name});
    Fb.renderInventoryMenuByName(name);
  }
}

Fb.InventoryTabList = class extends React.Component {
  constructor() {
   super();
   this.state = {current_tab: "Plants"};
  }

  render() {
    return <ul className="tabs">
            {
              this.props.items.map(function(item, i) {
                return <Fb.InventoryTab key={i}
                                        name={item}
                                        fml={this}
                                        active={this.state.current_tab === item}/>;
            }.bind(this))}
           </ul>
  }
}

Fb.InventoryMenu = class extends React.Component {
  render() {
    return (
      <div>
        <div className="search-box-wrapper">
          <input className="search" placeholder="Search"/>
        </div>
        <Fb.InventoryTabList items={["Plants", "Groups", "Zones"]} />
      </div>
    )
  }
};

Fb.InventoryContent = {};

Fb.InventoryContent.Plants = class extends React.Component {
  render() {
    return(
      <div>
        <Fb.InventoryList crops={ fakeCrops } />
        <Fb.ToolTip action={ Fb.renderCatalog } desc="Add a new plant" color="dark-green"/>
      </div>
    );
  }
};

Fb.InventoryContent.Groups = class extends React.Component {
  render() {
    return <p> This is where Groups will go </p>
  }
};

Fb.InventoryContent.Zones = class extends React.Component {
  render() {
    return <p> This is where Zones will go </p>
  }
};

Fb.InventoryList = class extends React.Component {
  render() {
    var crops = this.props.crops.map(
       (crop) => <Fb.InventoryItem crop={crop} key={crop._id} />
     );

    return(<ul className="crop-inventory"> { crops } </ul>);
  }
};

Fb.InventoryItem = class extends React.Component {
  render() {
    return(
      <li>
        <a href="#"> {this.props.crop.name} </a>
        <div>{this.props.crop.age} days old</div>
      </li>);
  }
};

Fb.renderInventoryMenuByName = function(name) {
  var menu = React.createElement(Fb.InventoryContent[name]);
  React.render(menu, Fb.leftMenuContent);
};

Fb.renderInventory = function(){
  React.render(<Fb.InventoryMenu />, Fb.leftMenu);
  Fb.renderInventoryMenuByName("Plants");
};
