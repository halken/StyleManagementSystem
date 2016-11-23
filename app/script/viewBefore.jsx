import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Modal} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

// ビュー(前)要素 (第7階層 /Window/Main/Home/Template/Component/Edit)
var ViewBefore = React.createClass({
	// getInitialState: function() {
	// 	return {
	// 		css: [];
	// 	};
	// },
	render: function() {
		var style = {};
		var css = this.props.cssValues;
		for (var i = 0; i < css.length; i++) {
			// console.log("property[" + i + "] => " + css[i].property);
			// console.log("value[" + i + "] => " + css[i].value);
			style[css[i].property] = css[i].value;
		}
		return (
			<div style={style}>
				Sample Texts
			</div>
		);
	}
});

module.exports = ViewBefore;
