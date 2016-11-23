import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";

import {Panel, Button, FormGroup, ControlLabel, FormControl, Modal} from "react-bootstrap";

// 外部JSP
const Menu = require("./menu");
const Main = require("./main");

// スタート画面 (第2階層 /Window)
var Setup = React.createClass({
	getInitialState: function() {
		return {
			host: "localhost",
			user: "",
			db: "",
			password: "",
			hostFlg: 'success',
			userFlg: 'success',
			dbFlg: 'success',
			pwFlg: 'success',
			conn: false,
			show: false
		};
	},
	handleChange: function(name, event) {
		var newState = {};
		newState[name] = event.target.value;
		this.setState(newState);
	},
	submitHandlar: function() {
		ipcRenderer.send("set-database-property", this.state.host, this.state.user, this.state.db, this.state.password);
		if ((this.state.host === "") || (this.state.user === "") || (this.state.db === "")) {
			if (this.state.host === "") {
				this.setState({
					hostFlg: 'error'
				});
			} else {
				this.setState({
					hostFlg: 'success'
				});
			}
			if (this.state.user === "") {
				this.setState({
					userFlg: 'error'
				});
			} else {
				this.setState({
					userFlg: 'success'
				});
			}
			if (this.state.db === "") {
				this.setState({
					dbFlg: 'error'
				});
			} else {
				this.setState({
					dbFlg: 'success'
				});
			}
		} else {
			var dbState = ipcRenderer.sendSync("connect-database");
			if (dbState) { // DB接続成功
				ipcRenderer.send("set-json", this.state.host, this.state.user, this.state.db, this.state.password);
				var tmp = ipcRenderer.sendSync("list-template");
				if (tmp == "Error") {
					this.setState({
						show: true
					});
				} else {
					this.setState({
						conn: true
					});
				}
			} else { // DB接続失敗
				alert("データベースの接続に失敗しました。")
			}
		}
	},
	createCancell: function() {
		this.setState({
			show: false
		});
	},
	createDefault: function() {
		var tmp = ipcRenderer.sendSync("create-default");
		this.setState({
			conn: true,
			show: false
		});
	},
	render: function() {
		if (this.state.conn) {
			return (
				<div id="content" className="pane-group">
					<Menu onHomeClick={this.props.onHomeClick} onImportClick={this.props.onImportClick} onExportClick={this.props.onExportClick} onOptionClick={this.props.onOptionClick} onChangeMenu={this.props.onChangeProperty} />
					<Main onChangeMain={this.props.onChangeProperty} onConnectDB={this.props.onConnectDB} />
				</div>
			);
		} else {
			return (
				<div className="pane setup">
					<h2 className="setup-title">Style Management System<br />for SuperSQL</h2>
					<div className="form-panel">
						<Panel>
							<form>
								<div className="form-group">
									<FormGroup validationState={this.state.hostFlg}>
										<ControlLabel>Host *</ControlLabel>
										<FormControl type="text" name="host" value={this.state.host} onChange={this.handleChange.bind(this, 'host')} />
									</FormGroup>
								</div>
								<div className="form-group">
									<FormGroup validationState={this.state.userFlg}>
										<ControlLabel>User *</ControlLabel>
										<FormControl type="text" name="user" value={this.state.user} onChange={this.handleChange.bind(this, 'user')} />
									</FormGroup>
								</div>
								<div className="form-group">
									<FormGroup validationState={this.state.dbFlg}>
										<ControlLabel>Database *</ControlLabel>
										<FormControl type="text" name="db" value={this.state.db} onChange={this.handleChange.bind(this, 'db')} />
									</FormGroup>
								</div>
								<div className="form-group">
									<FormGroup validationState={this.state.pwFlg}>
										<ControlLabel>Password</ControlLabel>
										<FormControl type="password" name="password" value={this.state.password} onChange={this.handleChange.bind(this, 'password')} />
									</FormGroup>
								</div>
								<Button onClick={this.submitHandlar}>OK</Button>
							</form>
						</Panel>
					</div>
					<Modal show={this.state.show} aria-labelledby="contained-modal-title">
						<Modal.Body>
	      					<div className="form-group">
	      						装飾メタDBが存在しません。新しく作成しますか？
	     					</div>
						</Modal.Body>
						<Modal.Footer>
							<button className="btn btn-large btn-default" onClick={this.createCancell}>Cancell</button>
							<button className="btn btn-large btn-positive" onClick={this.createDefault}>OK</button>
						</Modal.Footer>
					</Modal>
				</div>
			);
		}
	}
});

module.exports = Setup;