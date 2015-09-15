Fb = (window.Fb || {});

Fb.scheduleCreationMenu = class extends React.Component {
  render() {
    return(
      <div>
        <div className="search-box-wrapper">
          <p>
            <a href="#" onClick={Fb.renderInventory}>
              <i className="fa fa-arrow-left"></i>
            </a>
            Schedule Event
          </p>
        </div>
      </div>
    );
  }
}

Fb.scheduleCreationContent = class extends React.Component {
  render() {
    return <div>
              <h5>
                Choose A Sequence or Regimen
              </h5>
              <select>
                <option value="volvo">Volvo</option>
                <option value="saab">Saab</option>
                <option value="mercedes">Mercedes</option>
                <option value="audi">Audi</option>
              </select>
           </div>
  }
}

Fb.renderScheduleCreation = function() {
  console.log("HELLO?");
  React.render(<Fb.scheduleCreationMenu />, Fb.rightMenu);
  React.render(<Fb.scheduleCreationContent />, Fb.rightMenuContent);
};
