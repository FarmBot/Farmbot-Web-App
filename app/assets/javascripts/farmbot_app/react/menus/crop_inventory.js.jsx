Fb.Inventory = {}

Fb.Inventory.Tab = class extends React.Component {
  render() {
    return <li onClick={ this.handleClick.bind(this) }>
            <a href="#"
               className={this.props.active ? "active" : ""}>
              { this.props.name }
            </a>
           </li>
  }

  handleClick() { this.props.fml.setState({current_tab: this.props.name}); }
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
    return <p> This is where Groups will go </p>
  }
};

Fb.Inventory.Zones = class extends React.Component {
  render() {
    return <p> This is where Zones will go </p>
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
  constructor() {
   super();
   this.state = {current_tab: "Plants"};
  }

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
                                        fml={this}
                                        active={this.state.current_tab === item}/>;
            }.bind(this))}
          </ul>
        </div>

        { React.createElement(Fb.Inventory[this.state.current_tab]) }
      </div>
    )
  }
};


Fb.renderInventory = function(){
  React.render(<Fb.Inventory.Content />, Fb.leftMenu);
};
