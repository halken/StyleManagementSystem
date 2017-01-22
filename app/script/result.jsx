import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storage from 'electron-json-storage';
import pg from 'pg';
import {ipcRenderer} from "electron";
import {Panel, Button, Checkbox, FormGroup, ControlLabel, FormControl} from "react-bootstrap";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

// 外部JSX
const ResultPreview = require("./resultPreview");
const ResultTable = require("./resultTable");

// importの結果 (第4階層 /Window/Main/Result)
var Result = React.createClass({
	getInitialState: function() {
		return {
			name: '',
			item: '',
			userFlg: 'success',
			selected: []
		};
	},
	componentWillMount: function() {
		var tmp = this.props.filename;
		var num = tmp.indexOf('/');
		while (num != -1) {
			tmp = tmp.slice(num+1);
			num = tmp.indexOf('/');
		}
		num = tmp.indexOf('.css');
		if (num != -1) {
			tmp = tmp.slice(0, num);
		}
		this.setState({
			name: tmp
		});
	},
	handleChange: function(e) {
		if (e.target.value.length != 0) {
			this.setState({
				name: e.target.value,
				userFlg: 'success'
			});
		} else {
			this.setState({
				name: e.target.value,
				userFlg: 'error'
			});
		}
	},
	importCancell: function() {
		this.props.onCancellButton();
	},
	previewSelect: function(com, event) {
		console.log("selected item -> " + com.selector);
		this.setState({
			item: com
		});
	},
	selectItem: function(id, com, event) {
		var tmp = [];
		var flg = true;
		for (var i in this.state.selected) {
			if (id === this.state.selected[i].id) {
				flg = false; // 選択から削除
			} else { // 継続
				tmp = tmp.concat({id: this.state.selected[i].id, component: this.state.selected[i].component});
			}
		}
		if (flg) { // なかったら
			tmp = tmp.concat({id: id, component: com});
		}
		this.setState({
			selected: tmp.map(function(x) {return x})
		});
	},
	createTemplate: function() {
		// 1. templateにインサート
		var tem_id = ipcRenderer.sendSync("insert-template", this.state.name);
		for (var i in this.state.selected) {
			// 宣言が全く同じコンポーネントがあるかチェックすべき
			// TODO

			// 2. componentにインサート
			// デフォルトコンポーネントの宣言がなければいれる // TODO
			console.log(this.state.selected[i].component.selector.slice(1));
			var com_id = ipcRenderer.sendSync("insert-component", tem_id, this.state.selected[i].component.selector.slice(1));
			console.log("[count " + i + "] -> " + this.state.selected[i].component.declaration);
			for (var j in this.state.selected[i].component.declaration) {
				// 3. declarationにインサート
				var dec = ipcRenderer.sendSync("insert-declaration", com_id, this.state.selected[i].component.declaration[j].property, this.state.selected[i].component.declaration[j].value);
			}
		}
		this.props.onCancellButton();
	},
	render: function() {
		var component = [];
		for (var i in this.props.componentList) {
			component.push(<Panel className="result-item" key={"result_component_" + i} onClick={this.previewSelect.bind(this, this.props.componentList[i])}><Checkbox onClick={this.selectItem.bind(this, i, this.props.componentList[i])} inline>{this.props.componentList[i].selector}</Checkbox></Panel>);
		}
		return (
			<div className="result-content">
				<div className="result-title">
					<h1>CSS File import</h1>
					<div className="result-label">Name:</div>
					<form className="result-text">
						<FormGroup validationState={this.state.userFlg}>
							<FormControl type="text" value={this.state.name} onChange={this.handleChange} />
						</FormGroup>
					</form>
				</div>
    			<div className="result-panel">
    				<div className="result-list">
    					{component}
    				</div>
    				<div className="result-contents">
    					<div className="pane result-review">
    						<ResultPreview cssValues={this.state.item} />
    					</div>
    					<div className="result-declarations">
    						<ResultTable declarations={this.state.item} />
    					</div>
    				</div>
      			</div>
      			<footer className="toolbar toolbar-footer custom">
      				<Button className="result-ok" bsStyle="info" onClick={this.createTemplate}>Create Template</Button>
      				<Button className="result-cancell" onClick={this.importCancell}>Cancell</Button>
				</footer>
			</div>
    	);
 	}
});

module.exports = Result;