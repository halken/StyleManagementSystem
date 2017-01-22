import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Modal} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

// ビュー(後)要素 (第7階層 /Window/Main/Home/Template/Component/Edit)
var ViewAfter = React.createClass({
	getInitialState: function() {
		return {
			hover: false
		};
	},
	toggleHover: function() {
		this.setState({
			hover: !this.state.hover
		});
	},
	render: function() {
		var style = {};
		var hover = {};
		var css = this.props.cssValues;
		for (var i = 0; i < css.length; i++) {
			// console.log("property[" + i + "] => " + css[i].property);
			// console.log("value[" + i + "] => " + css[i].value);
			if (css[i].state === "deleted") {
				// not style
			} else {
				if (css[i].action === "hover") {
					hover[css[i].property] = css[i].value;
					style[css[i].property] = css[i].value;
				} else {
					style[css[i].property] = css[i].value;
				}
			}
		}
		var linkstyle;
		if (this.state.hover) {
			linkstyle = hover;
		} else {
			linkstyle = style;
		}
		return (
			<div style={linkstyle}>
				Sample Texts
			</div>
		);
	}
});

module.exports = ViewAfter;