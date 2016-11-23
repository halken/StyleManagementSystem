import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Modal, Button, FormGroup, ControlLabel, FormControl} from "react-bootstrap";

// component追加ボタン (第6階層 /Window/Main/Home/Template/Component)
var AddComponent = React.createClass({
	getInitialState: function() {
		return {
			name: '',
			show: false,
			userFlg: ''
		};
	},
	open: function() {
		this.setState({
			show: true
		});
	},
	close: function() {
		this.setState({
			name: '',
			show: false
		});
	},
	add: function() {
		if (this.state.name === '') { // 名前が空
			alert('New component name is empty.');
			return null;
		} else if (this.state.userFlg === 'error') { // 名前が重複
			alert("New component name is already used.");
			return null;
		} else {
			this.props.addComponentMethod(this.state.name);
			this.setState({
				name: '',
				show: false,
				userFlg: ''
			});
		}
	},
	handleChange: function(event) {
		var flag = true;
		for (var i in this.props.componentList) {
			if (event.target.value === this.props.componentList[i].name) {
				flag = false;
				break;
			}
		}
		if (flag && (event.target.value.length != 0)) {
			this.setState({
				name: event.target.value,
				userFlg: 'success'
			});
		} else {
			this.setState({
				name: event.target.value,
				userFlg: 'error'
			});
		}
	},
	render: function() {
		return (
			<div className="edit-button">
				<Button className="com-add" bsStyle="success" onClick={this.open}>New</Button>
				<Modal show={this.state.show} aria-labelledby="contained-modal-title">
					<Modal.Header closeButton>
						<Modal.Title id="contained-modal-title">Contained Modal</Modal.Title>
					</Modal.Header>
					<Modal.Body>
      					<div className="form-group">
      						<FormGroup validationState={this.state.userFlg}>
								<ControlLabel>New Component name</ControlLabel>
								<FormControl type="text" name="user" value={this.state.name} onChange={this.handleChange} />
							</FormGroup>
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

module.exports = AddComponent;
