import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Modal, Button} from "react-bootstrap";

// メインパネル (第3階層(B) /Window/Main)
var Footer = React.createClass({
	getInitialState: function() {
		return {
			mode: 'template'
		};
	},
	render: function() {
		switch (this.props.getMode) {
			case 'template':
				return (
					<footer className="toolbar toolbar-footer custom">
						<h1 className="title">template</h1>
					</footer>
				);
				break;
			case 'component':
				return (
					<footer className="toolbar toolbar-footer custom">
						<h1 className="title">component</h1>
					</footer>
				);
				break;
			case 'edit':
				return (
					<footer className="toolbar toolbar-footer custom">
						<h1 className="title">edit</h1>
					</footer>
				);
				break;
			default:
				return (
					<footer className="toolbar toolbar-footer custom">
						<h1 className="title">undified</h1>
					</footer>
				);
				break;
		}
		return (
			<footer className="toolbar toolbar-footer custom">
				<h1 className="title">template</h1>
			</footer>
		);
	}
});

module.exports = Footer;
