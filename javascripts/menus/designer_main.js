import { CropInventory } from './crop_inventory';
import { PlantCatalog } from './plant_catalog';
import { Calendar } from './calendar';
import { CropInfo } from './crop_info';
import { GardenMap } from './garden_map';

const LEFT_MENU_CHOICES = {CropInventory, PlantCatalog, CropInfo}

export class DesignerMain extends React.Component {
  transferableProps(name){
    return _.merge({}, {dispatch: this.props.dispatch}, this.props[name]);
  };
  // Dynamically determine what to render on the left side of the designer,
  // based on the value of getStore().leftMenu.component
  renderLeft() {
    let props = this.transferableProps("leftMenu")
    let component = LEFT_MENU_CHOICES[props.component];
    return React.createElement(component, props);
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
