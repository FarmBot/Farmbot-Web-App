import { PlantInventory } from './plant_inventory';
import { PlantCatalog } from './plant_catalog';
import { Calendar } from './calendar';
import { PlantInfo } from './plant_info';
import { CropInfo } from './crop_info';
import { GardenMap } from './garden_map';

const LEFT_MENU_CHOICES = {PlantInventory, PlantCatalog, PlantInfo, CropInfo}

export class DesignerMain extends React.Component {
  transferableProps(name){
    return _.merge({}, {dispatch: this.props.dispatch}, this.props[name]);
  };

  // Dynamically determine what to render on the left side of the designer,
  // based on the value of getStore().leftMenu.component
  renderLeft() {
    var props = this.transferableProps("leftMenu");
    var component = LEFT_MENU_CHOICES[props.component];
    if (!component) {
      var msg = `Attempted to render component ${props.component}, but valid choices are:`
      var choices = Object.keys(LEFT_MENU_CHOICES);
      console.warn(msg, choices);
    } else {
      return React.createElement(component, props);
    };
  }

  renderMiddle(){
    let props = this.transferableProps("middleMenu");
    return React.createElement(GardenMap, props);
  }

  render(){
    return (
      <div className="farm-designer-body">
        <div className="farm-designer-left">
          <div id="designer-left">
            { this.renderLeft() }
          </div>
        </div>

        <div className="farm-designer-middle">
          { this.renderMiddle() }
        </div>

        <div className="farm-designer-right">
          <div id="designer-right">
            <Calendar />
          </div>
        </div>
      </div>
    );
  }
}
