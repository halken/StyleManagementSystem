import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Modal, Button, Tabs, Tab} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

// 外部JSX
const ViewBefore = require("./viewBefore");
const ViewAfter = require("./viewAfter");
const DeclarationTable = require("./declarationTable");

// 編集モード (第6階層 /Window/Main/Home/Template/Component)
var Edit = React.createClass({
	getInitialState: function() {
		return {
			declaration: [],
			change_declaration: [],
			actions: [],
			add_tab: 0,
			active_tab: 1,
			add_count: 10000,
			show: false,
			property: '',
			value: '',
			action: ''
		};
	},
	componentWillMount: function() {
		var tmp = ipcRenderer.sendSync("list-declaration", this.props.temp, this.props.comp);
		var tmp2 = ipcRenderer.sendSync("list-declaration", this.props.temp, this.props.comp);
		var actions = [];
		for (var i in tmp2) {
			var flag = true;
			for (var j in actions) {
				if (actions[j] === tmp2[i].action) {
					flag = false;
				}
			}
			if (flag) {
				actions.push(tmp2[i].action);
			}
		}
		this.setState({
			declaration: tmp.map(function(x) {return x}),
			change_declaration: tmp2.map(function(x) {return x}),
			actions: actions.map(function(x) {return x}),
			add_tab: actions.length
		});
	},
	deleteDeclarationHandlar: function(id) {
		console.log("[deleteDeclarationHandlar] -> " + id);
		var tmp = [];
		for (var i = 0; i < this.state.change_declaration.length; i++) {
			if (id === this.state.change_declaration[i].id) {
				if (this.state.change_declaration[i].state === "added") {
					// delete
				} else {
					tmp = tmp.concat({id: this.state.change_declaration[i].id, property: this.state.change_declaration[i].property, value: this.state.change_declaration[i].value, action: this.state.change_declaration[i].action, state: "deleted"});
				}
			} else {
				tmp = tmp.concat({id: this.state.change_declaration[i].id, property: this.state.change_declaration[i].property, value: this.state.change_declaration[i].value, action: this.state.change_declaration[i].action, state: this.state.change_declaration[i].state});
			}
		}
		this.setState({
			change_declaration: tmp.map(function(x) {return x})
		});
	},
	cancellDeleteHandlar: function(id) {
		console.log("[cancellDeleteHandlar] -> " + id);
		var tmp = [];
		for (var i = 0; i < this.state.change_declaration.length; i++) {
			if (id === this.state.change_declaration[i].id) {
				for (var j = 0; j < this.state.declaration.length; j++) {
					if (id === this.state.declaration[j].id) {
						if ((this.state.change_declaration[i].property === this.state.declaration[j].property) && (this.state.change_declaration[i].value === this.state.declaration[j].value)) {
							tmp = tmp.concat({id: this.state.change_declaration[i].id, property: this.state.change_declaration[i].property, value: this.state.change_declaration[i].value, action: this.state.change_declaration[i].action, state: ''});
							// console.log("[[[[[event 111]]]]]");
						} else {
							tmp = tmp.concat({id: this.state.change_declaration[i].id, property: this.state.change_declaration[i].property, value: this.state.change_declaration[i].value, action: this.state.change_declaration[i].action, state: "changed"});
							// console.log("[[[[[event 222]]]]]");
						}
					}
				}
			} else {
				tmp = tmp.concat({id: this.state.change_declaration[i].id, property: this.state.change_declaration[i].property, value: this.state.change_declaration[i].value, action: this.state.change_declaration[i].action, state: this.state.change_declaration[i].state});
				// console.log("[[[[[event 333]]]]]");
			}
		}
		this.setState({
			change_declaration: tmp.map(function(x) {return x})
		});
	},
	addRowHandlar: function(property, value) {
		var tmp = [];
		for (var i = 0; i < this.state.change_declaration.length; i++) {
			tmp = tmp.concat({id: this.state.change_declaration[i].id, property: this.state.change_declaration[i].property, value: this.state.change_declaration[i].value, action: this.state.change_declaration[i].action, state: this.state.change_declaration[i].state});
		}
		var num = this.state.active_tab - 1;
		console.log(">>>>> " + num + " >>>>> " + this.state.actions[num]);
		tmp = tmp.concat({id: this.state.add_count, property: property, value: value, action: this.state.actions[num], state: 'added'});
		this.setState({
			change_declaration: tmp.map(function(x) {return x}),
			add_count: this.state.add_count + 1
		});
	},
	// OnBeforeSaveCell: function(row, cellName, cellValue) {
	// 	console.log("[before cell] Save cell '" + cellName + "' with value '" + cellValue + "'");
	// 	console.log("[before cell] The whole row :");
	// 	console.log(row);
	// },
	OnAfterSaveCell: function(row, cellName, cellValue) {
		var tmp = [];
		for (var i = 0; i < this.state.change_declaration.length; i++) {
			if (row.id === this.state.change_declaration[i].id) {
				for (var j = 0; j < this.state.declaration.length; j++) {
					if (row.id === this.state.declaration[j].id) {
						if ((row.property === this.state.declaration[j].property) && (row.value === this.state.declaration[j].value)) {
							tmp = tmp.concat({id: row.id, property: row.property, value: row.value, action: row.action, state: ''});
							// console.log("[[[[[event 111]]]]]");
						} else {
							tmp = tmp.concat({id: row.id, property: row.property, value: row.value, action: row.action, state: "changed"});
							// console.log("[[[[[event 222]]]]]");
						}
					}
				}
			} else {
				tmp = tmp.concat({id: this.state.change_declaration[i].id, property: this.state.change_declaration[i].property, value: this.state.change_declaration[i].value, action: this.state.change_declaration[i].action, state: this.state.change_declaration[i].state});
				// console.log("[[[[[event 333]]]]]");
			}
		}
		this.setState({
			change_declaration: tmp.map(function(x) {return x})
		});
	},
	changeDeclaration: function() {
		for (var i = 0; i < this.state.change_declaration.length; i++) {
			var tmp = '';
			switch (this.state.change_declaration[i].state) {
				case "added": // todo
					tmp = ipcRenderer.sendSync("insert-declaration", this.props.comp, this.state.change_declaration[i].property, this.state.change_declaration[i].value, this.state.change_declaration[i].action);
					break;
				case "deleted":
					tmp = ipcRenderer.sendSync("delete-declaration", this.props.comp, this.state.change_declaration[i].id);
					break;
				case "changed":
					tmp = ipcRenderer.sendSync("update-declaration", this.props.comp, this.state.change_declaration[i].id, this.state.change_declaration[i].property, this.state.change_declaration[i].value);
					break;
				default:
					break;
			}
		}
		this.props.clickBackButton();
	},
	getDeclarationTable: function(num, action, item) {
		if (action === '') {
			action = 'default';
		}
		var cellEditProp = {
			mode: "click",
			blurToSave: true,
			// beforeSaveCell: this.OnBeforeSaveCell,
			afterSaveCell: this.OnAfterSaveCell
		};
		num = parseInt(num, 10) + 1;
		console.log("[action.length] -> " + num );
		if (item != null) {
			return (
				<Tab eventKey={num} title={action}>
					<div className="com-original">
						<DeclarationTable addRowButton={this.addRowHandlar} cellData={item} cellEdit={cellEditProp} cancellDelete={this.cancellDeleteHandlar} deleteDeclaration={this.deleteDeclarationHandlar} />
					</div>
				</Tab>
			);
		} else {
			return (
				<Tab eventKey={num} title={action} onClick={this.addAction}>
					test
				</Tab>
			);
		}
	},
	addAction: function(key) {
		if (key === (this.state.add_tab + 1)) {
			this.open();
		} else {
			this.setState({
				active_tab: key
			});
		}
	},
	open: function() {
		this.setState({
			show: true
		});
	},
	close: function() {
		this.setState({
			show: false
		});
	},
	add: function() {
		alert(this.state.property + ", " + this.state.value + ", " + this.state.action);
		var tmp = [];
		for (var i = 0; i < this.state.change_declaration.length; i++) {
			tmp = tmp.concat({id: this.state.change_declaration[i].id, property: this.state.change_declaration[i].property, value: this.state.change_declaration[i].value, action: this.state.change_declaration[i].action, state: this.state.change_declaration[i].state});
		}
		tmp = tmp.concat({id: this.state.add_count, property: this.state.property, value: this.state.value, action: this.state.action, state: 'added'});
		var tmp2 = [];
		var flag = true;
		for (var i = 0; i < this.state.actions.length; i++) {
			tmp2.push(this.state.actions[i]);
			if (this.state.action === this.state.actions[i]) {
				flag = false;
			}
		}
		if (flag) {
			tmp2.push(this.state.action);
			this.setState({
				change_declaration: tmp.map(function(x) {return x}),
				actions: tmp2.map(function(x) {return x}),
				add_tab: tmp2.length,
				active_tab: tmp2.length,
				add_count: this.state.add_count + 1,
				show: false,
				property: '',
				value: '',
				action: ''
			});
		} else {
			this.setState({
				change_declaration: tmp.map(function(x) {return x}),
				actions: tmp2.map(function(x) {return x}),
				add_count: this.state.add_count + 1,
				show: false,
				property: '',
				value: '',
				action: ''
			});
		}
	},
	handleChange: function(name, event) {
		var newState = {};
		newState[name] = event.target.value;
		this.setState(newState);
	},
	selectChange: function(event) {
		this.setState({
			action: event.target.value
		});
	},
 	render: function() {
		var cellEditProp = {
			mode: "click",
			blurToSave: true,
			// beforeSaveCell: this.OnBeforeSaveCell,
			afterSaveCell: this.OnAfterSaveCell
		};

		//

		var tabs = [];
		for (var i in this.state.actions) {
			var item = [];
			for (var j in this.state.change_declaration) {
				if (this.state.actions[i] === this.state.change_declaration[j].action) {
					item.push(this.state.change_declaration[j]);
				}
			}
			tabs.push(this.getDeclarationTable(i, this.state.actions[i], item));
		}
		var num = this.state.actions.length;
		tabs.push(this.getDeclarationTable(num, '+', null));

		//
		return (
			<div className="edit">
				<div className="edit-content">
					<div className="edit-title">
						<h1>Edit Mode</h1>
						<div className="edit-names">
							Template: {this.props.selectedTemplate}, Component: {this.props.selectedComponent}
						</div>
					</div>
					<div className="viewer">
						<div className="pane before">
							<ViewBefore cssValues={this.state.declaration}/>
						</div>
						<div className="pane after">
							<ViewAfter cssValues={this.state.change_declaration}/>
						</div>
					</div>
					<Tabs id="component-tab" activeKey={this.state.active_tab} bsStyle="tabs" onSelect={this.addAction}>
						{tabs}
					</Tabs>
					<div className="edit-space"></div>
				</div>
				<footer className="toolbar toolbar-footer custom">
					<Button className="edit-back" onClick={this.props.clickBackButton}>Back</Button>
					<Button className="edit-ok" onClick={this.changeDeclaration} bsStyle="info">OK</Button>
				</footer>
				<Modal show={this.state.show} aria-labelledby="contained-modal-title">
					<Modal.Header>
						<Modal.Title id="contained-modal-title">add action</Modal.Title>
					</Modal.Header>
					<Modal.Body>
      					<div className="form-group">
      						<label>Property</label>
      						<input type="text" name="user" value={this.state.property} className="form-control" onChange={this.handleChange.bind(this, 'property')} />
     					</div>
     					<div className="form-group">
      						<label>Value</label>
      						<input type="text" name="db" value={this.state.value} className="form-control" onChange={this.handleChange.bind(this, 'value')} />
     					</div>
     					<div className="form-group">
     						<label>Action</label>
     						<select name="action" value={this.state.action} className="form-control" onChange={this.selectChange}>
     							<option value="">-</option>
     							<option value="link">link</option>
     							<option value="visited">visited</option>
     							<option value="hover">hover</option>
     							<option value="active">active</option>
     						</select>
     					</div>
					</Modal.Body>
					<Modal.Footer>
						<button className="btn btn-large btn-default" onClick={this.close}>Cancell</button>
						<button className="btn btn-large btn-positive" onClick={this.add}>OK</button>
					</Modal.Footer>
				</Modal>
			</div>
		);
	}
});

module.exports = Edit;
