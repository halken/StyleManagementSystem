import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Modal} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

// 外部JSX
const Template = require("./template");

// Home (第3階層 /Window/Main)
var Home = React.createClass({
	render: function() {
		return (
			<div className="pane">
        		<Template />
        	</div>
		);
	}
});

module.exports = Home;
