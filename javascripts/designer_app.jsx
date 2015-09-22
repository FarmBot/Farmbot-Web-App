export class DesignerApp extends React.Component {
  render() {
    return <div className="farm-designer-body">
             <p>{store.getState().UI.inventoryTab}</p>
             <div className="farm-designer-left">
               <div id="designer-left">
                 { React.createElement(store.getState().UI.leftMenu) }
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

  }
}
