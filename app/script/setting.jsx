import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Panel, Button, ButtonGroup} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

// Option (第3階層 /Window/Main)
var Setting = React.createClass({
	getInitialState: function() {
	    return {
	    	  host: '',
	          user: '',
	          db: '',
	          password: '',
	          window1: 'primary',
	          window2: 'default'
	    };
	},
	componentWillMount: function() {
		// 過去設定ファイル(JSONファイル)の読み込み
		var hostName = ipcRenderer.sendSync("get-host");
		var userName = ipcRenderer.sendSync("get-user");
		var dbName = ipcRenderer.sendSync("get-db");
		var pwName = ipcRenderer.sendSync("get-pw");
		var size = ipcRenderer.sendSync("get-window-size");
		if (size[0] == 1024) {
			this.setState({
				host: hostName,
				user: userName,
				db : dbName,
				password: pwName,
				window1: 'primary',
				window2: 'default'
			});
		} else { // size[0] == 1200
			this.setState({
				host: hostName,
				user: userName,
				db : dbName,
				password: pwName,
				window1: 'default',
				window2: 'primary'
			});
		}
	},
	handleChange: function(name, event) {
		var newState = {};
		newState[name] = event.target.value;
		this.setState(newState);
	},
	submitHandlar: function() {
		ipcRenderer.send("set-database-property", this.state.host, this.state.user, this.state.db, this.state.password);
		var dbState = ipcRenderer.sendSync("connect-database");
		if (dbState) { // DB接続成功
			ipcRenderer.send("set-json", this.state.host, this.state.user, this.state.db, this.state.password);
			this.props.onConnectDB;
		} else { // DB接続失敗
			alert("データベースの接続に失敗しました。")
		}
	},
	changeWindowSize: function(value, event) {
		switch(value) {
			case 1:
				ipcRenderer.send("set-window-size", 1024, 768);
				ipcRenderer.send("set-window-size", 1024, 768);
				this.setState({
					window1: 'primary',
					window2: 'default'
				});
				break;
			case 2:
				ipcRenderer.send("set-window-size", 1200, 900);
				ipcRenderer.send("set-window-size", 1200, 900);
				this.setState({
					window1: 'default',
					window2: 'primary'
				});
				break;
			default:
				break;
		}
	},
 	render: function() {
    	return (
    		<div className="pane">
    			<div className="option-title">
    				<h1>DB connect Page</h1>
    			</div>
    			<hr />
    			<Panel className="option-panel">
	    			<form>
	    				<div className="form-group">
	      					<label>Host *</label>
	      					<input type="text" name="host" value={this.state.host} className="form-control" onChange={this.handleChange.bind(this, 'host')} />
	     				</div>
	      				<div className="form-group">
	      					<label>User *</label>
	      					<input type="text" name="user" value={this.state.user} className="form-control" onChange={this.handleChange.bind(this, 'user')} />
	     				</div>
	     				<div className="form-group">
	      					<label>Database *</label>
	      					<input type="text" name="db" value={this.state.db} className="form-control" onChange={this.handleChange.bind(this, 'db')} />
	     				</div>
	     				<div className="form-group">
	      					<label>Password</label>
	      					<input type="text" name="password" value={this.state.password} className="form-control" onChange={this.handleChange.bind(this, 'password')} />
	     				</div>
	     				<Button onClick={this.submitHandlar}>OK</Button>
	      			</form>
      			</Panel>
      			<Panel className="option-panel">
      				<ButtonGroup>
      					<Button bsStyle={this.state.window1} onClick={this.changeWindowSize.bind(this, 1)}>1024 ✕ 788</Button>
      					<Button bsStyle={this.state.window2} onClick={this.changeWindowSize.bind(this, 2)}>1200 ✕ 900</Button>
      				</ButtonGroup>
      			</Panel>
      		</div>
    	);
 	}
});

module.exports = Setting;