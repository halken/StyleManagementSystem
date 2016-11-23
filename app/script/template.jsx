import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Panel, Button, SplitButton, MenuItem, Modal, FormGroup, ControlLabel, FormControl} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

// 外部JSX
const Component = require("./component");
const AddTemplate = require("./addTemplate");

// Template List (第4階層 /Window/Main/Home)
var Template = React.createClass({
	getInitialState: function() {
		return {
			temp: [],
			id: '',
			name: '',
			mode: '',
			chgid: '',
			chgname: '',
			show: false,
			userFlg: 'success',
			check: false,
			chk_id: ''
		};
	},
	componentWillMount: function() {
		var tmp = ipcRenderer.sendSync("list-template");
		this.setState({
			temp: tmp.map(function(x) {return x})
		});
	},
	backTemplateHandlar: function() {
		this.setState({
			id: ''
		});
	},
	clickAddButton: function() {
		this.setState({
			mode: 'add'
		});
	},
	backModeTemplate: function() {
		var tmp = ipcRenderer.sendSync("list-template");
		this.setState({
			temp: tmp.map(function(x) {return x}),
			mode: ''
		});
	},
	onRowSelect: function(id, name, event) {
		this.setState({
			id: id,
			name: name
		});
	},
	deleteCheck: function(id, e) {
		this.setState({
			check: true,
			chk_id: id
		});
	},
	deleteCancell: function() {
		this.setState({
			check: false,
			chk_id: ''
		});
	},
	deleteTemplate: function() {
		var tmp = ipcRenderer.sendSync("delete-template", this.state.chk_id);
		this.setState({
			temp: tmp.map(function(x) {return x}),
			check: false,
			chk_id: ''
		});
	},
	getDropdownButton: function(id, name) {
		return (
			<SplitButton className="tmp-item" onClick={this.onRowSelect.bind(this, id, name)} title={name} key={"tem"+id} id={`split-button-basic-${id}`}>
				<MenuItem onClick={this.onRowSelect.bind(this, id, name)} eventKey="1">Select</MenuItem>
				<MenuItem onClick={this.open.bind(this, id, name)} eventKey="2">Change Name</MenuItem>
				<MenuItem divider />
				<MenuItem onClick={this.deleteCheck.bind(this, id)} eventKey="3">Delete</MenuItem>
			</SplitButton>
		);
	},
	open: function(id, name, event) {
		this.setState({
			name: name,
			chgid: id,
			chgname: name,
			show: true,
			userFlg: 'success'
		});
	},
	close: function() {
		this.setState({
			name: '',
			chgid: '',
			chgname: '',
			show: false,
			userFlg: 'success'
		});
	},
	change: function() {
		if (this.state.chgname === '') { // 名前が空
			alert('Change name empty.');
			return null;
		} else if (this.state.userFlg === 'error') { // 名前が重複
			alert('Change name duplicate.');
			return null;
		} else { // 名前の変更
			var tmp = ipcRenderer.sendSync("update-template", this.state.chgid, this.state.chgname);
			// var tmp = ipcRenderer.sendSync("list-template");
			this.setState({
				temp: tmp.map(function(x) {return x}),
				name: '',
				chgid: '',
				chgname: '',
				show: false,
				userFlg: 'success'
			});
		}
	},
	handleChange: function(event) {
		var flag = true;
		for (var i in this.state.temp) {
			if ((this.state.temp[i].name != this.state.name) && (this.state.temp[i].name === event.target.value)) {
				flag = false;
				break;
			}
		}
		if (flag && (event.target.value.length != 0)) {
			this.setState({
				chgname: event.target.value,
				userFlg: 'success'
			});
		} else {
			this.setState({
				chgname: event.target.value,
				userFlg: 'error'
			});
		}
	},
	render: function() {
		// var selectRowProp = {
		// 	mode: "radio",
		// 	clickToSelect: true,
		// 	hideSelectColumn: true,
		// 	// onSelect: onRowSelect
		// 	onSelect: this.onRowSelect
		// };
		var item = [];
		for (var i in this.state.temp) {
			// item.push(<Panel id={this.state.temp[i].id} className="tmp-item" onClick={this.onRowSelect.bind(this, this.state.temp[i].id, this.state.temp[i].name)} key={this.state.temp[i].id}>{this.state.temp[i].name}</Panel>);
			item.push(this.getDropdownButton(this.state.temp[i].id, this.state.temp[i].name));
		}
		if (this.state.mode === 'add') {
			return (
				<div className="templates">
					<AddTemplate clickBackButton={this.backModeTemplate} />
				</div>
			);
		} else if (this.state.id === '') {
			return (
				<div className="templates">
					<div className="tmp-content">
						<div className="tmp-title">
							<h1>Template List</h1>
						</div>
						<hr />
						<div className="tmp-list">
							{item}
						</div>
					</div>
					<footer className="toolbar toolbar-footer custom">
						<Button className="tem-add" bsStyle="success" onClick={this.clickAddButton}>New</Button>
					</footer>
					<Modal show={this.state.show} aria-labelledby="contained-modal-title">
						<Modal.Header closeButton>
							<Modal.Title id="contained-modal-title">Change Template Name</Modal.Title>
						</Modal.Header>
						<Modal.Body>
	      					<div className="form-group">
	      						<FormGroup validationState={this.state.userFlg}>
									<ControlLabel>Name</ControlLabel>
									<FormControl type="text" name="chgname" value={this.state.chgname} onChange={this.handleChange} />
								</FormGroup>
	     					</div>
						</Modal.Body>
						<Modal.Footer>
							<button className="btn btn-large btn-default" onClick={this.close}>Cancell</button>
							<button className="btn btn-large btn-positive" onClick={this.change}>OK</button>
						</Modal.Footer>
					</Modal>
					<Modal show={this.state.check} aria-labelledby="contained-modal-title">
						<Modal.Body>
	      					<div className="form-group">
	      						Do you really want to delete selected template?
	     					</div>
						</Modal.Body>
						<Modal.Footer>
							<button className="btn btn-large btn-default" onClick={this.deleteCancell}>Cancell</button>
							<button className="btn btn-large btn-positive" onClick={this.deleteTemplate}>OK</button>
						</Modal.Footer>
					</Modal>
				</div>
			);
		} else {
			return (
				<div className="templates">
					<Component clickBackButton={this.backTemplateHandlar} selected={this.state.id} selectedTemplate={this.state.name} />
				</div>
			);
		}
	}
});


module.exports = Template;