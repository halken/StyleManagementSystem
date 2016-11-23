import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Button} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

var ResultTable = React.createClass({
	getInitialState: function() {
	    return {
	    	  height: 300
	    };
	},
	componentWillMount: function() {
		var size = ipcRenderer.sendSync("get-window-size");
		if (size[0] == 1024) {
			this.setState({
				height: 280
			});
		} else { // size == 1200
			this.setState({
				height: 300
			});
		}
	},
	render: function() {
		var select = this.props.declarations;
		var item = [];
		if (select == '') {
			// itemはそのまま
		} else {
			item = select.declaration;
		}
		return (
			<BootstrapTable data={item} striped={true} hover={true} height={this.state.height}>
     			<TableHeaderColumn isKey={true} dataField="property" editable={false}>Property</TableHeaderColumn>
     			<TableHeaderColumn dataField="value">Value</TableHeaderColumn>
			</BootstrapTable>
		);
	}
});

module.exports = ResultTable;