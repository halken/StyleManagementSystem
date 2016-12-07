import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Modal, Button} from "react-bootstrap";
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
			add_count: 10000
		};
	},
	componentWillMount: function() {
		var tmp = ipcRenderer.sendSync("list-declaration", this.props.temp, this.props.comp);
		var tmp2 = ipcRenderer.sendSync("list-declaration", this.props.temp, this.props.comp);
		this.setState({
			declaration: tmp.map(function(x) {return x}),
			change_declaration: tmp2.map(function(x) {return x})
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
					tmp = tmp.concat({id: this.state.change_declaration[i].id, property: this.state.change_declaration[i].property, value: this.state.change_declaration[i].value, state: "deleted"});
				}
			} else {
				tmp = tmp.concat({id: this.state.change_declaration[i].id, property: this.state.change_declaration[i].property, value: this.state.change_declaration[i].value, state: this.state.change_declaration[i].state});
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
							tmp = tmp.concat({id: this.state.change_declaration[i].id, property: this.state.change_declaration[i].property, value: this.state.change_declaration[i].value, state: ''});
							// console.log("[[[[[event 111]]]]]");
						} else {
							tmp = tmp.concat({id: this.state.change_declaration[i].id, property: this.state.change_declaration[i].property, value: this.state.change_declaration[i].value, state: "changed"});
							// console.log("[[[[[event 222]]]]]");
						}
					}
				}
			} else {
				tmp = tmp.concat({id: this.state.change_declaration[i].id, property: this.state.change_declaration[i].property, value: this.state.change_declaration[i].value, state: this.state.change_declaration[i].state});
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
			tmp = tmp.concat({id: this.state.change_declaration[i].id, property: this.state.change_declaration[i].property, value: this.state.change_declaration[i].value, state: this.state.change_declaration[i].state});
		}
		tmp = tmp.concat({id: this.state.add_count, property: property, value: value, state: 'added'});
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
							tmp = tmp.concat({id: row.id, property: row.property, value: row.value, state: ''});
							// console.log("[[[[[event 111]]]]]");
						} else {
							tmp = tmp.concat({id: row.id, property: row.property, value: row.value, state: "changed"});
							// console.log("[[[[[event 222]]]]]");
						}
					}
				}
			} else {
				tmp = tmp.concat({id: this.state.change_declaration[i].id, property: this.state.change_declaration[i].property, value: this.state.change_declaration[i].value, state: this.state.change_declaration[i].state});
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
				case "added":
					tmp = ipcRenderer.sendSync("insert-declaration", this.props.comp, this.state.change_declaration[i].property, this.state.change_declaration[i].value);
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
	render: function() {
		var cellEditProp = {
			mode: "click",
			blurToSave: true,
			// beforeSaveCell: this.OnBeforeSaveCell,
			afterSaveCell: this.OnAfterSaveCell
		};
		return (
			<div className="edit">
				<div className="edit-content">
					<div className="edit-title">
						<h1>Edit Mode</h1>
						<div className="edit-names">
							Template: {this.props.selectedTemplate}, Component: {this.props.selectedComponent}
						</div>
					</div>
					<hr />
					<div className="viewer">
						<div className="pane before">
							<ViewBefore cssValues={this.state.declaration}/>
						</div>
						<div className="pane after">
							<ViewAfter cssValues={this.state.change_declaration}/>
						</div>
					</div>
					<DeclarationTable addRowButton={this.addRowHandlar} cellData={this.state.change_declaration} cellEdit={cellEditProp} cancellDelete={this.cancellDeleteHandlar} deleteDeclaration={this.deleteDeclarationHandlar} />
					<div className="edit-space"></div>
				</div>
				<footer className="toolbar toolbar-footer custom">
					<Button className="edit-back" onClick={this.props.clickBackButton}>Back</Button>
					<Button className="edit-ok" onClick={this.changeDeclaration} bsStyle="info">OK</Button>
				</footer>
			</div>
		);
	}
});

module.exports = Edit;
