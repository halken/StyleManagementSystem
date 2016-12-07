import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Panel, ListGroup, ListGroupItem, Button, FormGroup, ControlLabel, FormControl} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';


// テンプレートの追加 (第4階層 /Window/Main/Template)
var AddTemplate = React.createClass({
	getInitialState: function() {
		return {
			temp: [],
			def: [],
			add: [],
			value: '',
			userFlg: 'error',
			count: 0
		};
	},
	componentWillMount: function() {
		var def = ipcRenderer.sendSync("get-default-component");
		var tmp = ipcRenderer.sendSync("list-add-template", def);
		var tmp2 = ipcRenderer.sendSync("list-add-template-default", def);
		this.setState({
			temp: tmp.map(function(x) {return x}),
			def: tmp2.map(function(x) {return x})
		});
	},
	handleChange: function(e) {
		var flag = true;
		for (var i in this.state.temp) {
			if (this.state.temp[i].name === e.target.value) {
				flag = false;
				break;
			}
		}
		if (flag && (e.target.value.length != 0)) {
			this.setState({
				value: e.target.value,
				userFlg: 'success'
			});
		} else {
			this.setState({
				value: e.target.value,
				userFlg: 'error'
			});
		}
	},
	addOrDeleteComponent: function(id, name, event) {
		var tmp = [];
		var flag = true;
		for (var i in this.state.add) {
			if (id === this.state.add[i].id) { // 同じidなら削除対象
				flag = false;
			} else {
				if (name === this.state.add[i].name) {
					// do nothing
				} else {
					tmp.push({id: this.state.add[i].id, name: this.state.add[i].name});
				}
			}
		}
		if (flag) {
			tmp.push({id: id, name: name});
		}
		this.setState({
			add: tmp.map(function(x) {return x}),
			count: tmp.length
		});
	},
	newCreateTemplate: function() {
		if (this.state.value === '') { // templateの名前が空
			alert('New template name empty.');
			return null;
		} else if (this.state.userFlg === 'error') { // templateの名前が重複
			alert('New template name duplicate.');
			return null;
		} else { // templateの追加
			var tmp_id = ipcRenderer.sendSync("insert-template", this.state.value);
			var def = ipcRenderer.sendSync("get-default-component");
			for (var i in this.state.add) {
				ipcRenderer.send("insert-tem_com", tmp_id, this.state.add[i].id);
			}
			for (var i in def) {
				var flag = true;
				for (var j in this.state.add) {
					if (def[i] === this.state.add[j].name) {
						flag = false;
						break;
					}
				}
				if (flag) {
					ipcRenderer.send("insert-component", tmp_id, def[i]);
				}
			}
			this.props.clickBackButton();
		}
	},
	render: function() {
		var item = [];
		// default component
		var def_com = [];
		for (var i in this.state.def) {
			var flag = true;
			for (var j in this.state.add) {
				if (this.state.add[j].id === this.state.def[i].c_id) {
					def_com.push(<ListGroupItem bsStyle="success" key={this.state.def[i].t_id + "_" + this.state.def[i].c_id} onClick={this.addOrDeleteComponent.bind(this, this.state.def[i].c_id, this.state.def[i].c_name)}>{this.state.def[i].t_name + " - " + this.state.def[i].c_name}</ListGroupItem>);
					flag = false;
					break;
				}
			}
			if (flag) {
				def_com.push(<ListGroupItem key={this.state.def[i].t_id + "_" + this.state.def[i].c_id} onClick={this.addOrDeleteComponent.bind(this, this.state.def[i].c_id, this.state.def[i].c_name)}>{this.state.def[i].t_name + " - " + this.state.def[i].c_name}</ListGroupItem>);
			}
		}
		item.push(<Panel className="add-tmp-group" collapsible key={"panel_default"} header={"default-component"}><ListGroup fill key={"list-default"}>{def_com}</ListGroup></Panel>);
		// defalut以外のcomponent
		for (var i in this.state.temp) {
			var item2 = [];
			var def = ipcRenderer.sendSync("get-default-component");
			var list = ipcRenderer.sendSync("list-add-component", this.state.temp[i].id, def);
			for (var j in list) {
				var flag = true;
				for (var k in this.state.add) {
					if (this.state.add[k].id === list[j].id) {
						item2.push(<ListGroupItem bsStyle="success" key={this.state.temp[i].id + "_" + list[j].id} onClick={this.addOrDeleteComponent.bind(this, list[j].id, list[j].name)}>{list[j].name}</ListGroupItem>);
						flag = false;
						break;
					}
				}
				if (flag) {
					item2.push(<ListGroupItem key={this.state.temp[i].id + "_" + list[j].id} onClick={this.addOrDeleteComponent.bind(this, list[j].id, list[j].name)}>{list[j].name}</ListGroupItem>);
				}
			}
			item.push(<Panel className="add-tmp-group" collapsible key={"panel_" + this.state.temp[i].id} header={this.state.temp[i].name}><ListGroup fill key={"list_" + this.state.temp[i].id}>{item2}</ListGroup></Panel>);
		}
		return (
			<div className="add-temp">
				<div className="tmp-content">
					<div className="add-tmp-title">
						<h1>Add Template</h1>
						<div className="add-tmp-label">New Template Name:</div>
						<form className="add-tmp-text">
							<FormGroup validationState={this.state.userFlg}>
								<FormControl type="text" value={this.state.value} onChange={this.handleChange} />
							</FormGroup>
						</form>
						<div className="add-tmp-count">Selected Components: {this.state.count}</div>
					</div>
					<div className="add-tmp-list">
						{item}
					</div>
				</div>
				<footer className="toolbar toolbar-footer custom">
					<Button className="tem-back" onClick={this.props.clickBackButton}>Back</Button>
					<Button className="add-tmp-ok" bsStyle="info" onClick={this.newCreateTemplate}>OK</Button>
				</footer>
			</div>
		);
	}
});

module.exports = AddTemplate;