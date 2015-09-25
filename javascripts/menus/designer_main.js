import { CropInventory } from './crop_inventory';
import { PlantCatalog } from './plant_catalog';
import { Calendar } from './calendar';

// React component
export class DesignerMain extends React.Component {
  // Dynamically determine what to render on the left side of the designer,
  // based on the value of getStore().leftMenu.component
  renderPanel() {
    let {tab, component} = this.props.leftMenu;
    let dispatch = this.props.dispatch;
    let target = {CropInventory, PlantCatalog}[component];
    return React.createElement(target, {tab, dispatch});
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
