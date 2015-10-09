export class Navbar extends React.Component {
  render() {
    return <div className="row">
             <nav className="drop-shadow">
               <div className="small-menu-title">MENU</div>
               <a href="/">Home</a>
                 <a href="/pages/farm_designer">Farm Designer</a>
                 <a href="/dashboard#/movement">Controls</a>
                 <a href="/dashboard#/devices">Devices</a>
                 <a href="/dashboard#/sequence">Sequences</a>
                 <a href="/dashboard#/schedule">Schedules</a>
                 <a className="large-menu-right" href="/users/sign_out">Sign out</a>
                 <a className="large-menu-right" href="/users/edit">My Account</a>
                 <button className="red button-like" type="button">Stop*</button>
                 <button className="yellow button-like" type="button">
                   Sync <i className="fa fa-upload"></i>*
                 </button>
                 LAST SYNC: Never
             </nav>
           </div>
  }
}
