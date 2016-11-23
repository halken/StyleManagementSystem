import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Modal} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

var ResultPreview = React.createClass({
	render: function() {
		var style = {};
		var css = this.props.cssValues;
		if (css == '') {
			return (
				<div>
					Preview window
				</div>
			);
		} else {
			css = css.declaration;
			for (var i = 0; i < css.length; i++) {
				// console.log("property[" + i + "] => " + css[i].property);
				// console.log("value[" + i + "] => " + css[i].value);
				if (css[i].state === "deleted") {
					// not style
				} else {
					style[css[i].property] = css[i].value;
				}
			}
			return (
				<div style={style}>
					Sample Texts
				</div>
			);
		}
	}
});

module.exports = ResultPreview;