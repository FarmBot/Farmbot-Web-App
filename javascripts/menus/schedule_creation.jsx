export class ScheduleCreation extends React.Component {
  back() { Fb.renderCalendar(); }

  render() {
    var html = (
    <div>
      <div>
        <div className="search-box-wrapper purple-content">
          <p>
            <a href="#" onClick={ this.back }>
              <i className="fa fa-arrow-left"></i>
            </a>
            Schedule Event
          </p>
        </div>
      </div>
      <div className="designer-info">
        <h6>Chose a Sequence or Regimen</h6>
        <select>
          <option value="volvo">Volvo</option>
          <option value="saab">Saab</option>
          <option value="mercedes">Mercedes</option>
          <option value="audi">Audi</option>
        </select>
        <h6>Starts</h6>
        <div className="flex">
          <input placeholder="Today"
                 type="text"
                 className="flex3"></input>
          <select className="flex3">
            <option value="volvo">12:30</option>
            <option value="saab">12:00</option>
          </select>
        </div>
        <h6>Repeats</h6>
        <div className="flex">
          <input placeholder="2"
                 type="text"
                 className="flex3"></input>
          <select className="flex3">
            <option value="volvo">days</option>
            <option value="saab">hours</option>
          </select>
          <input type="checkbox" name="wow" value="no">Does not repeat</input>
        </div>
        <h6>Ends</h6>
        <div className="flex">
          <input placeholder="Today"
                 type="text"
                 className="flex3"></input>
          <select className="flex3">
            <option value="volvo">12:30</option>
            <option value="saab">12:00</option>
          </select>
        </div>
        <div>
          <button className="purple-content">
            Save
          </button>
        </div>
      </div>
    </div>
    )
    return html;
  }
}

Fb.renderScheduleCreation = function() {
  React.render(<Fb.ScheduleCreation />, Fb.rightMenu);
};
