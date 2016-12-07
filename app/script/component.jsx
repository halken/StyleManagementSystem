import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Modal, Panel, Button, SplitButton, MenuItem, FormGroup, ControlLabel, FormControl, Tabs, Tab} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

// 外部JSX
const AddComponent = require("./addComponent");
const Edit = require("./edit");

// Component List (第5階層 /Window/Main/Home/Template)
var Component = React.createClass({
	getInitialState: function() {
		return {
			comp: [],
			id: '',
			name: '',
			chgid: '',
			chgname: '',
			show: false,
			userFlg: 'success',
			check: false,
			chk_id: '',
			default_comp: []
		};
	},
	componentWillMount: function() {
		var tmp = ipcRenderer.sendSync("list-component", this.props.selected);
		var def = ipcRenderer.sendSync("get-default-component");
		this.setState({
			comp: tmp.map(function(x) {return x}),
			default_comp: def.map(function(x) {return x})
		});
	},
	backComponentHandlar: function() {
		this.setState({
			id: ''
		});
	},
	addComponentHandlar: function(name) {
		var tmp = ipcRenderer.sendSync("insert-component", this.props.selected, name);
		this.setState({
			id: tmp
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
	deleteComponent: function() {
		var tmp = ipcRenderer.sendSync("delete-component", this.props.selected, this.state.chk_id);
		this.setState({
			comp: tmp.map(function(x) {return x}),
			check: false,
			chk_id: ''
		});
	},
	getDropdownButton: function(id, name) {
		return (
			<SplitButton className="com-item" onClick={this.onRowSelect.bind(this, id, name)} title={name} key={"com"+id} id={`split-button-basic-${id}`}>
				<MenuItem onClick={this.onRowSelect.bind(this, id, name)} eventKey="1">Select</MenuItem>
				<MenuItem onClick={this.open.bind(this, id, name)} eventKey="2">Change Name</MenuItem>
				<MenuItem divider />
				<MenuItem onClick={this.deleteCheck.bind(this, id)} eventKey="3">Delete</MenuItem>
			</SplitButton>
		);
	},
	getDefaultButton: function(id, name) {
		return (
			<Button className="com-def" onClick={this.onRowSelect.bind(this, id, name)} key={"def"+id}>{name}</Button>
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
			var tmp = ipcRenderer.sendSync("update-component", this.state.chgid, this.state.chgname, this.props.selected);
			this.setState({
				comp: tmp.map(function(x) {return x}),
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
		for (var i in this.state.comp) {
			if ((this.state.comp[i].name != this.state.name) && (this.state.comp[i].name === event.target.value)) {
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
		var default_item = [];
		for (var i in this.state.comp) {
			var flag = false;
			for (var j = 0; j < this.state.default_comp.length; j++) {
				if (this.state.default_comp[j] === this.state.comp[i].name) {
					flag = true;
					break;
				}
			}
			if (flag) {
				default_item.push(this.getDefaultButton(this.state.comp[i].id, this.state.comp[i].name));
			} else {
				item.push(this.getDropdownButton(this.state.comp[i].id, this.state.comp[i].name));
			}
		}
		if (this.state.id === '') {
			return (
				<div className="components">
					<div className="components-content">
						<div className="com-title">
							<h1>{this.props.selectedTemplate}</h1>
						</div>
						<hr />
						<div className="com-list">
							<Tabs id="component-tab" defaultActiveKey={1} bsStyle="pills">
								<Tab eventKey={1} title="original">
									<div className="com-original">
										{item}
									</div>
								</Tab>
								<Tab eventKey={2} title="default">
									<div className="com-original">
										{default_item}
									</div>
								</Tab>
							</Tabs>
						</div>
					</div>
					<footer className="toolbar toolbar-footer custom">
						<Button className="com-back" onClick={this.props.clickBackButton}>Back</Button>
						<AddComponent componentList={this.state.comp} addComponentMethod={this.addComponentHandlar}/>
					</footer>
					<Modal show={this.state.show} aria-labelledby="contained-modal-title">
						<Modal.Header closeButton>
							<Modal.Title id="contained-modal-title">Change Component Name</Modal.Title>
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
	      						Do you really want to delete selected component?
	     					</div>
						</Modal.Body>
						<Modal.Footer>
							<button className="btn btn-large btn-default" onClick={this.deleteCancell}>Cancell</button>
							<button className="btn btn-large btn-positive" onClick={this.deleteComponent}>OK</button>
						</Modal.Footer>
					</Modal>
				</div>
			);
		} else {
			return (
				<div className="components">
					<Edit temp={this.props.selected} comp={this.state.id} selectedTemplate={this.props.selectedTemplate} selectedComponent={this.state.name} clickBackButton={this.backComponentHandlar} changeModeEdit={this.props.changeModeEdit}/>
				</div>
			);
		}
	}
});

module.exports = Component;
