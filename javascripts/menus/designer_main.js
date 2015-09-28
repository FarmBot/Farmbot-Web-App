import { CropInventory } from './crop_inventory';
import { PlantCatalog } from './plant_catalog';
import { Calendar } from './calendar';
import { CropInfo } from './crop_info';

const MENU_CHOICES = {CropInventory, PlantCatalog, CropInfo}

export class DesignerMain extends React.Component {
  // Dynamically determine what to render on the left side of the designer,
  // based on the value of getStore().leftMenu.component
  renderPanel() {
    let props = _.merge({},
                        {dispatch: this.props.dispatch},
                        this.props.leftMenu);
    let component = MENU_CHOICES[props.component];
    return React.createElement(component, props);
  }
  render(){
    return (
      <div className="farm-designer-body">
        <div className="farm-designer-left">
          <div id="designer-left">
            { this.renderPanel() }
          </div>
        </div>

        <div className="farm-designer-middle">
          <div></div>
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
