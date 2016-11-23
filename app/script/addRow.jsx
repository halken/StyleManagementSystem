import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Modal, Button} from "react-bootstrap";

// 宣言の追加 (第7階層 /Window/Main/Home/Template/Component/Edit)
var AddRow = React.createClass({
	getInitialState: function() {
		return {
			property: '',
			value: '',
			show: false
		};
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
		this.props.addRowMethod(this.state.property, this.state.value);
		this.setState({
			property: '',
			value: '',
			show: false
		})
	},
	handleChange: function(name, event) {
		var newState = {};
		newState[name] = event.target.value;
		this.setState(newState);
	},
	render: function() {
		return (
			<div className="edit-button">
				<Button bsStyle="success" bsSize="xsmall" onClick={this.open}>
					<span className="icon icon-plus custom"></span>Insert
				</Button>
				<Modal show={this.state.show} aria-labelledby="contained-modal-title">
					<Modal.Header>
						<Modal.Title id="contained-modal-title">Insert declaration</Modal.Title>
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

module.exports = AddRow;
