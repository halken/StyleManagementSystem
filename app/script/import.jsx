import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Panel, Button} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

// 外部JSX
const Result = require("./result");

// CSSインポート (第3階層 /Window/Main/)
var Import = React.createClass({
	getInitialState: function() {
		return {
			filename: '',
			list: []
		};
	},
	OpenCSSFile: function() {
		var filename = ipcRenderer.sendSync("open-css-file");
		var list = ipcRenderer.sendSync("css-parse", filename);
		this.setState({
			filename: filename,
			list: list.map(function(x) {return x})
		});
	},
	CancellHandlar: function() {
		this.setState({
			filename: '',
			list: []
		});
	},
	render: function() {
		if (this.state.filename === '') {
			return (
    			<div className="pane">
    				<div className="import-title">
    					<h1>CSS File import</h1>
    				</div>
    				<hr />
    				<Panel className="import-panel">
    					<Button onClick={this.OpenCSSFile}>Import</Button>
      				</Panel>
      			</div>
    		);
		} else {
			return (
				<div className="pane">
					<Result filename={this.state.filename} componentList={this.state.list} onCancellButton={this.CancellHandlar} />
				</div>
			);
		}
 	}
});

module.exports = Import;