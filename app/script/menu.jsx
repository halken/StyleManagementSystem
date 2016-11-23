import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {ipcRenderer} from 'electron';

// サイドバーメニュー (第2階層(A) /Window)
var Menu = React.createClass({
	render: function() {
		var homeActive = 'nav-group-item custom';
		var importActive = 'nav-group-item custom';
		var exportActive = 'nav-group-item custom';
		var optionActive = 'nav-group-item custom';
		switch (this.props.onChangeMenu) {
			case 'home':
				homeActive = homeActive + ' active';
				break;
			case 'import':
				importActive = importActive + ' active';
				break;
			case 'export':
				exportActive = exportActive + ' active';
				break;
			case 'option':
				optionActive = optionActive + ' active';
				break;
			default:
				homeActive = homeActive + ' active';
				break;
		}
		ipcRenderer.send("select-menu-log", this.props.onChangeMenu);
		return (
			<div id="menu" className="pane pane-sm sidebar custom">
				<nav className="nav-group">
           			<h4 className="nav-group-title custom">Style Management System<br />for SuperSQL</h4>
      	    		<span className={homeActive} onClick={this.props.onHomeClick}>
            			<span className="icon icon-home custom"></span>Home
            		</span>
            		<span className={importActive} onClick={this.props.onImportClick}>
            			<span className="icon icon-download custom"></span>Import
            		</span>
            		<span className={exportActive} onClick={this.props.onExportClick}>
            			<span className="icon icon-upload custom"></span>Export
            		</span>
            		<span className={optionActive} onClick={this.props.onOptionClick}>
            			<span className="icon icon-tools custom"></span>Option
            		</span>
        		</nav>
			</div>
		);
	}
});

module.exports = Menu;