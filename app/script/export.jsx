import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Panel, Button} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

// CSSインポート (第3階層 /Window/Main/)
var Export = React.createClass({
	render: function() {
    	return (
    		<div className="pane">
    			<div className="export-title">
    				<h1>CSS File export</h1>
    			</div>
    			<hr />
    			<Panel className="export-panel">
    				Coming soon ...
      			</Panel>
      		</div>
    	);
 	}
});

module.exports = Export;