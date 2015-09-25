export class ToolTip extends React.Component {
  render() {
    return(
      <div>
        <div className="fb-tooltip">
          <div className="tooltip-text">
            { this.props.desc }
          </div>
        </div>
        <span className={ (this.props.color || "") + " plus-circle" }
              onClick={ this.props.action }>
        </span>
      </div>
    );
  }
};
