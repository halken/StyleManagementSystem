import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Panel, Button} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

// CSSインポート (第3階層 /Window/Main/)
var Export = React.createClass({
    exportSQLFile: function() {
        var filename = ipcRenderer.sendSync("save-sql-file");
        var e = ipcRenderer.sendSync("export-sql-file", filename);
        if (e != null) {
            alert("Export SQL File Error : " + e);
        } else {
            alert("Export SQL File Complete.");
        }
    },
	render: function() {
    	return (
    		<div className="pane">
    			<div className="export-title">
    				<h1>CSS File export</h1>
    			</div>
    			<hr />
    			<Panel className="export-panel">
    				<Button onClick={this.exportSQLFile}>SQL file</Button>
      			</Panel>
      		</div>
    	);
 	}
});

module.exports = Export;