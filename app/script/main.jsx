import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Modal} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

// 外部JSX
const Setting = require("./setting");
// const Home = require("./home");
const Template = require("./template");
const Import = require("./import");
const Export = require("./export");

// メインパネル (第2階層(B) /Window)
var Main = React.createClass({
	render: function() {
		switch (this.props.onChangeMain) {
			case 'home': 
				return (
					<div id="main" className="pane">
						<Template />
					</div>
				);
				break;
			case 'import':
				return (
					<div id="main" className="pane">
						<Import />
					</div>
				);
				break;
			case 'export':
				return (
					<div id="main" className="pane">
						<Export />
					</div>
				);
				break;
			case 'option': 
				return (
					<div id="main" className="pane">
						<Setting onConnectDB={this.props.onConnectDB}/>
					</div>
				);
				break;
			default:
				return (
					<div id="main" className="pane">
						<Template />
					</div>
				);
				break;
		}
	}
});

module.exports = Main;