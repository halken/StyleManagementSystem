import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Modal} from "react-bootstrap";

// 外部JSX
const Setup = require("./setup");
const Menu = require("./menu");
const Main = require("./main");

// ユーザDB情報
var user = "";
var db = "";
var conString = "";

// Window画面 (第1階層)
var Window = React.createClass({
	getInitialState: function() {
	    return {
	    	db: false,
	    	main: 'home'
	    };
	},
	componentWillMount: function() {
		// 過去設定ファイル(JSONファイル)の読み込み
		var configState = ipcRenderer.sendSync("load-config");
		if (configState) {
			var dbState = ipcRenderer.sendSync("connect-database");
		}
		this.setState({
			db : dbState
		});
	},
	homeHandlar: function() {
		this.setState({
			main: 'home'
		});
		console.log('Home button');
	},
	importHandlar: function() {
		this.setState({
			main: 'import'
		});
	},
	exportHandlar: function() {
		this.setState({
			main: 'export'
		});
	},
	optionHandlar: function() {
		this.setState({
			main: 'option'
		});
		console.log('Option button');
	},
	connectDBHandlar: function() {
		this.setState({
			db: true
		});
		console.log("db connect flag");
	},
	render: function() {
		if (this.state.db) {
			return (
				<div id="content" className="pane-group">
					<Menu onHomeClick={this.homeHandlar} onImportClick={this.importHandlar} onExportClick={this.exportHandlar} onOptionClick={this.optionHandlar} onChangeMenu={this.state.main} />
					<Main onChangeMain={this.state.main} onConnectDB={this.connectDBHandlar} />
				</div>
			);
		} else {
			return (
				<div id="content" className="pane-group">
					<Setup onConnectDB={this.connectDBHandlar} onHomeClick={this.homeHandlar} onImportClick={this.importHandlar} onExportClick={this.exportHandlar} onOptionClick={this.optionHandlar} onChangeProperty={this.state.main} />
				</div>
			);
		}
		
	}
});

ReactDOM.render(
	<Window />,
	document.getElementById('window')
);