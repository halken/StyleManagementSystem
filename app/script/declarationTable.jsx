import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Button} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

// 外部JSX
const AddRow = require("./addRow");

// 宣言テーブル (第7階層 /Window/Main/Home/Template/Component/Edit)
var DeclarationTable = React.createClass({
	getInitialState: function() {
	    return {
	    	  height: 370
	    };
	},
	componentWillMount: function() {
		var size = ipcRenderer.sendSync("get-window-size");
		if (size[0] == 1024) {
			this.setState({
				height: 270
			});
		} else { // size == 1200
			this.setState({
				height: 370
			});
		}
	},
	buttonFormatter: function(cell, row) {
		function cancellDeleteFunc(id) {
			this.props.cancellDelete(id);
		}
		function deleteDeclarationFunc(id) {
			this.props.deleteDeclaration(id);
		}
		console.log(row.state);
		if (row.state == "deleted") {
			return <Button bsSize="xsmall" onClick={this.cancellDeleteFunc.bind(this, row.id)}><span className="icon icon-back"></span></Button>;
		} else {
			return <Button bsSize="xsmall" onClick={this.deleteDeclarationFunc.bind(this, row.id)}><span className="icon icon-trash"></span></Button>;
		}
	},
	cancellDeleteFunc: function(id, event) {
		this.props.cancellDelete(id);
	},
	deleteDeclarationFunc: function(id, event) {
		this.props.deleteDeclaration(id);
	},
	render: function() {
		// function buttonFormatter(cell, row) {
		// 	console.log(row.state);
		// 	if (row.state === "changed") {
		// 		return <button className="btn btn-mini btn-default"><span className="icon icon-back"></span></button>;
		// 	} else {
		// 		return <button className="btn btn-mini btn-default"><span className="icon icon-trash"></span></button>;
		// 	}
		// };
		return (
			<BootstrapTable data={this.props.cellData} cellEdit={this.props.cellEdit} striped={true} hover={true} height={this.state.height}>
				<TableHeaderColumn hidden={true} isKey={true} dataField="id">Product ID</TableHeaderColumn>
				<TableHeaderColumn dataField="button" dataFormat={this.buttonFormatter} width="80" editable={false}><AddRow addRowMethod={this.props.addRowButton} /></TableHeaderColumn>
     			<TableHeaderColumn dataField="property" editable={false}>Property</TableHeaderColumn>
     			<TableHeaderColumn dataField="value">Value</TableHeaderColumn>
     			<TableHeaderColumn dataField="state" width="150" editable={false}>State</TableHeaderColumn>
			</BootstrapTable>
		);
	}
});

module.exports = DeclarationTable;
