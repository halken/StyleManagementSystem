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
			add: [],
			value: '',
			userFlg: 'error',
			count: 0
		};
	},
	componentWillMount: function() {
		var tmp = ipcRenderer.sendSync("list-add-template");
		this.setState({
			temp: tmp.map(function(x) {return x})
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
	addOrDeleteComponent: function(id, event) {
		var tmp = [];
		var flag = true;
		for (var i in this.state.add) {
			if (id === this.state.add[i].id) {
				flag = false;
			} else {
				tmp.push({id: this.state.add[i].id});
			}
		}
		if (flag) {
			tmp.push({id: id});
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
			for (var i in this.state.add) {
				ipcRenderer.send("insert-tem_com", tmp_id, this.state.add[i].id);
			}
			this.props.clickBackButton();
		}
	},
	render: function() {
		var item = [];
		for (var i in this.state.temp) {
			var item2 = [];
			var list = ipcRenderer.sendSync("list-component", this.state.temp[i].id);
			for (var j in list) {
				var flag = true;
				for (var k in this.state.add) {
					if (this.state.add[k].id === list[j].id) {
						item2.push(<ListGroupItem bsStyle="success" key={this.state.temp[i].id + "_" + list[j].id} onClick={this.addOrDeleteComponent.bind(this, list[j].id)}>{list[j].name}</ListGroupItem>);
						flag = false;
						break;
					}
				}
				if (flag) {
					item2.push(<ListGroupItem key={this.state.temp[i].id + "_" + list[j].id} onClick={this.addOrDeleteComponent.bind(this, list[j].id)}>{list[j].name}</ListGroupItem>);
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