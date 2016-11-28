
const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;
const {crashReporter} = electron;
const ipcMain = require("electron").ipcMain;
const async = require("async");

const storage = require("electron-json-storage");
const pg = require("pg");

// ファイル読み込み標準ライブラリ
var fs = require("fs");

// CSSParserライブラリ
var Parser = require("./cssParser.js");

if(process.env.NODE_ENV === 'develop'){
  crashReporter.start();
}

const rootPath = `file://${__dirname}`;
let mainWindow = null;

var host = "";
var user = "";
var db = "";
var password = "";
var config = {
	host: host,
	user: user,
	database: db,
	password: password,
	port: 5432,
	max: 10,
	idleTimeoutMillis: 30000
};
var conString = "";

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  // mainWindow = new BrowserWindow({width: 1200, height: 900, minWidth: 1200, minHeight: 900, maxWidth: 1200, maxHeight: 900, show: false});
  mainWindow = new BrowserWindow({width: 1024, height: 768, minWidth: 1024, minHeight: 768, maxWidth: 1024, maxHeight: 768, show: false});
  mainWindow.loadURL(`${rootPath}/index.html`);
  console.log(mainWindow.getSize());
  // mainWindow.webContents.openDevTools();
  mainWindow.once('ready-to-show', () => { // 全て読み込んでからブラウザ表示する
  	mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on("window-all-closed", () => {
  app.quit();
});

// 設定ファイル(config.json)があるかのチェック関数
ipcMain.on("load-config", (sender) => {
	storage.get('config', (err, data) => {
		if (err) {
			cnosole.log(err);
		} else {
			if (Object.keys(data).length === 0) {
				// 設定ファイルの中身がないときの処理
				console.log("No config File -> Create File");
				sender.returnValue = false;
			} else {
				// 設定ファイルがあるときの処理
				console.log("Exist config File.");
				host = data.host;
				user = data.user;
				db = data.db;
				password = data.password;
				sender.returnValue = true;
				// conString = "tcp://" + user + "@localhost:5432/" + db;
			}
		}
	});
});

ipcMain.on("set-database-property", (sender, newHost, newUser, newDB, newPW) => {
	if (newHost === "") {
		console.log("[Error] No input host!");
	} else {
		host = newHost;
		console.log("host = " + newHost);
	}
	if (newDB === "") {
		console.log("[Error] No input database!");
	} else {
		db = newDB;
		console.log("db = " + newDB);
	}
	if (newUser === "") {
		console.log("[Error] No input user!");
	} else {
		user = newUser;
		console.log("user = " + newUser);
	}
	if (newDB === "") {
		console.log("[Error] No input database!");
	} else {
		db = newDB;
		console.log("db = " + newDB);
	}
	if (newPW === "") {
		console.log("[Notice] No input password.");
	} else {
		password = newPW;
		console.log("password = " + newPW);
	}
	// conString = "tcp://" + newUser + "@localhost:5432/" + newDB;
});

// データベース接続チェック
ipcMain.on("connect-database", (sender) => {
	config = {
		host: host,
		user: user,
		database: db,
		password: password
	};

	var pool = new pg.Pool(config);

	pool.connect(function(err, client, done) {
		if (err) {
			// DB接続失敗
			console.error('error fetching client from pool', err);
			sender.returnValue = false;
		} else {
			// DB接続成功
			console.log('Database connected.');
			sender.returnValue = true;
		}
	});
});

// 新しく装飾メタDBを作成
ipcMain.on("create-default", (sender) => {
	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {
		if (err) {
			// DB接続失敗
			console.log(err);
		} else {
			// DB接続成功
			console.log("connect create-defalut");
			async.waterfall([
				function(callback) {
					const str1 = "CREATE TABLE template (id serial PRIMARY KEY, name varchar UNIQUE)";
					client.query(str1, (err, result) => {
						done();
						if (err) {
							console.log("create table template Error!");
						} else {
							console.log("create table template success.");
							callback(null);
						}
					});
				},
				function(callback) {
					const str2 = "CREATE TABLE component (id serial PRIMARY KEY, name varchar)";
					client.query(str2, (err, result) => {
						done();
						if (err) {
							console.log("create table component Error!");
						} else {
							console.log("create table component success.");
							callback(null);
						}
					});
				},
				function(callback) {
					const str3 = "CREATE TABLE declaration (id serial PRIMARY KEY, property varchar, value varchar, UNIQUE (property, value))";
					client.query(str3, (err, result) => {
						done();
						if (err) {
							console.log("create table declaration Error!");
						} else {
							console.log("create table declaration success.");
							callback(null);
						}
					});
				},
				function(callback) {
					const str4 = "CREATE TABLE com_dec (com_id int REFERENCES component (id), dec_id int REFERENCES declaration (id))";
					client.query(str4, (err, result) => {
						done();
						if (err) {
							console.log("create table com_dec Error!");
						} else {
							console.log("create table com_dec success.");
							callback(null);
						}
					});
				},
				function(callback) {
					const str5 = "CREATE TABLE tem_com (tem_id int REFERENCES template (id), com_id int REFERENCES component (id))";
					client.query(str5, (err, result) => {
						done();
						if (err) {
							console.log("create table tem_com Error!");
						} else {
							console.log("create table tem_com success.");
							callback(null);
						}
					});
				},
			], function(err) {
				const str6 = "INSERT INTO template (name) VALUES ('sample')";
				client.query(str6, (err, result) => {
					done();
					if (err) {
						console.log("sample insert template Error!");
					} else {
						console.log("sample insert template success.");
						sender.returnValue = null;
					}
				});
			});
		}
	});
});

// 画面サイズの変更
  ipcMain.on("set-window-size", (sender, width, height) => {
	mainWindow.setSize(width, height);
	mainWindow.setMaximumSize(width, height);
	mainWindow.setMinimumSize(width, height);
	console.log("width: " + width + ", height: " + height);
  });

ipcMain.on("list-template", (sender) => {
	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {
		if (err) {
			// DB接続失敗
			console.log(err);
		} else {
			// DB接続成功
			client.query("SELECT id, name FROM template", (err, result) => {
				done();
				if (err) {
					console.log("template loading Error!");
					sender.returnValue = "Error";
				} else {
					console.log("connect template table.");
					var tmp = [];
					for (var i = 0; i < result.rows.length; i++) {
						tmp = tmp.concat({id: result.rows[i].id, name: result.rows[i].name});
					}
					sender.returnValue = tmp;
				}
			});
		}
	});
});

ipcMain.on("list-add-template", (sender) => {
	var pool = new  pg.Pool(config);
	pool.connect(function (err, client, done) {
		if (err) {
			// DB接続失敗
			console.log(err);
		} else {
			// DB接続成功
			var str = "SELECT t.id, t.name FROM template t, component c, tem_com tc WHERE t.id=tc.tem_id AND c.id=tc.com_id GROUP BY t.id ORDER BY t.id";
			client.query(str, (err, result) => {
				done();
				if (err) {
					console.log("add template id list loading Error!");
				} else {
					console.log("connect add template id list.");
					var tmp = [];
					for (var i = 0; i < result.rows.length; i++) {
						tmp = tmp.concat({
							id: result.rows[i].id,
							name: result.rows[i].name
						});
					}
					sender.returnValue = tmp;
				}
			});
		}
	});
});

// ipcMain.on("list-add-component", (sender) => {
// 	var pool = new  pg.Pool(config);
// 	pool.connect(function (err, client, done) {
// 		if (err) {
// 			// DB接続失敗
// 			console.log(err);
// 		} else {
// 			// DB接続成功
// 			var str = "SELECT t.id as t_id, t.name as template, c.id as c_id, c.name as component FROM template t, component c, tem_com tc WHERE t.id=tc.tem_id AND c.id=tc.com_id ORDER BY t.id";
// 			client.query(str, (err, result) => {
// 				done();
// 				if (err) {
// 					console.log("add template, component list loading Error!");
// 				} else {
// 					console.log("connect add template, component list.");
// 					var tmp = [];
// 					for (var i = 0; i < result.rows.length; i++) {
// 						tmp = tmp.concat({
// 							t_id: result.rows[i].t_id,
// 							temp: result.rows[i].template,
// 							c_id: result.rows[i].c_id,
// 							com: result.rows[i].component
// 						});
// 					}
// 					sender.returnValue = tmp;
// 				}
// 			});
// 		}
// 	});
// });

ipcMain.on("list-component", (sender, tem_id) => {
	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {
		if (err) {
			// DB接続失敗
			console.log(err);
		} else {
			// DB接続成功
			const str = "SELECT c.id, c.name FROM component c, template t, tem_com tc WHERE t.id=tc.tem_id AND c.id=tc.com_id AND t.id=" + tem_id;
			console.log("query -> " + str);
			client.query(str, (err, result) => {
				done();
				if (err) {
					console.log("component loading Error!");
				} else {
					console.log("connect component table.");
					var tmp = [];
					for (var i = 0; i < result.rows.length; i++) {
						tmp = tmp.concat({id: result.rows[i].id, name: result.rows[i].name});
					}
					sender.returnValue = tmp;
				}
			});
		}
	});
});

ipcMain.on("list-declaration", (sender, tem_id, com_id) => {
	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {
		if (err) {
			// DB接続失敗
			console.log(err);
		} else {
			// DB接続成功
			const str = "SELECT d.id, d.property, d.value FROM declaration d, component c, template t, tem_com tc, com_dec cd "
						+ "WHERE t.id=tc.tem_id AND c.id=tc.com_id AND c.id=cd.com_id AND d.id=cd.dec_id AND t.id="
						+ tem_id + " AND c.id=" + com_id;
			console.log("query -> " + str);
			client.query(str, (err, result) => {
				done();
				if (err) {
					console.log("declaration loading Error!");
				} else {
					console.log("connect declaration table.");
					var tmp = [];
					for (var i = 0; i < result.rows.length; i++) {
						tmp = tmp.concat({id: result.rows[i].id, property: result.rows[i].property, value: result.rows[i].value, state: ''});
					}
					sender.returnValue = tmp;
				}
			});
		}
	});
});

ipcMain.on("insert-template", (sender, name) => {
	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {
		if (err) {
			// DB接続失敗
			console.log(err);
		} else {
			// DB接続成功
			const str = "INSERT INTO template (name) VALUES ('" + name + "') RETURNING id";
			console.log("query -> " + str);
			client.query(str, (err, result) => {
				done();
				if (err) {
					console.log("template insert Error!");
				} else {
					console.log("template insert success.");
					sender.returnValue = result.rows[0].id;
				}
			});
		}
	});
});

ipcMain.on("insert-component", (sender, tem_id, name) => {
	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {
		if (err) {
			// DB接続失敗
			console.log(err);
		} else {
			// DB接続成功
			async.waterfall([
				function(callback) {
					const str1 = "INSERT INTO component (name) VALUES ('" + name + "') RETURNING id";
					console.log("query -> " + str1);
					client.query(str1, (err, result) => {
						done();
						if (err) {
							console.log("component insert Error!");
						} else {
							console.log("component insert success.");
							console.log("id[0] => " + result.rows[0].id); 
							callback(null, result.rows[0].id);
						}
					});
				}
			], function(err, com_id) {
				const str2 = "INSERT INTO tem_com VALUES (" + tem_id + ", " + com_id + ")";
				console.log("query -> " + str2);
				client.query(str2, (err, result) => {
					done();
					if (err) {
						console.log("tem_com insert Error!");
					} else {
						console.log("tem_com insert success.");
						sender.returnValue = com_id;
					}
				});
			});
		}
	});
});

ipcMain.on("insert-declaration", (sender, com_id, property, value) => {
	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {
		if (err) {
			// DB接続失敗
			console.log(err);
		} else {
			// DB接続成功
			async.waterfall([
				function(callback) {
					const str1 = "SELECT * FROM declaration WHERE property='" + property + "' AND value='" + value + "'";
					console.log("[str1]query -> " + str1);
					client.query(str1, (err, result) => {
						done();
						if (err) {
							console.log("declaration check Error!");
						} else {
							console.log("declaration check success.");
							if (result.rows.length != 0) {
								callback(null, result.rows[0].id);
							} else {
								callback(null, null);
							}
						}
					});
				},
				function(dec_id, callback) {
					if (dec_id == null) {
						const str2 = "INSERT INTO declaration (property, value) VALUES ('" + property + "', '" + value + "') RETURNING id";
						console.log("[str2]query -> " + str2);
						client.query(str2, (err, result) => {
							done();
							if (err) {
								console.log("insert declaration Error!");
							} else {
								console.log("insert declaration success.");
								callback(null, result.rows[0].id);
							}
						});
					} else {
						callback(null, dec_id);
					}
				},
			], function(err, dec_id) {
				const str3 = "INSERT INTO com_dec VALUES (" + com_id + ", " + dec_id + ")";
				console.log("[str3]query -> " + str3);
				client.query(str3, (err, result) => {
					done();
					if (err) {
						console.log("insert com_dec Error!");
					} else {
						console.log("insert com_dec success.");
						sender.returnValue = null;
					}
				});
			});
		}
	});
});

ipcMain.on("insert-tem_com", (sender, tem_id, com_id) => {
	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {
		if (err) {
			// DB接続失敗
			console.log(err);
		} else {
			// DB接続成功
			const str = "INSERT INTO tem_com VALUES (" + tem_id + ", " + com_id + ")";
			console.log("query -> " + str);
			client.query(str, (err, result) => {
				done();
				if (err) {
					console.log("tem_com insert Error!");
				} else {
					console.log("tem_com insert success.");
				}
			});
		}
	});
});

ipcMain.on("delete-template", (sender, tem_id) => {
	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {
		if (err) {
			// DB接続失敗
			console.log(err);
		} else {
			// DB接続成功

			async.waterfall([
				function(callback) {
					// 1. tem_comの削除
					console.log("1. start");
					var tmp_com = [];
					const str1 = "DELETE FROM tem_com WHERE tem_id=" + tem_id + " RETURNING com_id";
					console.log("[str1]query -> " + str1);
					client.query(str1, (err, result) => {
						done();
						if (err) {
							console.log("tem_com delete Error!");
						} else {
							console.log("tem_com delete success. " + result.rows.length);
							for (var i = 0; i < result.rows.length; i++) {
								tmp_com = tmp_com.concat({id: result.rows[i].com_id});
								console.log(i + " tmp_com: " + tmp_com);
							}
						}
						// デバッグログ
						console.log("tmp_com: " + tmp_com.length);
						for (var i in tmp_com) {
							console.log("tmp_com[" + i + "] -> " + tmp_com[i].id);
						}
						callback(null, tmp_com);
					});
				},
				function(tmp_com, callback) {
					// 2. tem_comのcheck
					console.log("2. start");
					var com = [];
					const str2 = "SELECT * FROM component c WHERE NOT EXISTS (SELECT * FROM tem_com tc WHERE c.id=tc.com_id)";
					console.log("[str2]query -> " + str2);
					client.query(str2, (err, result) => {
						done();
						if (err) {
							console.log("check tem_com Error!");
						} else {
							for (var i = 0; i < result.rows.length; i++) {
								com = com.concat({id: result.rows[i].id});
							}
						}
						// デバッグログ
						console.log("com: " + com.length);
						for (var i in com) {
							console.log("com[" + i + "] -> " + com[i].id);
						}
						callback(null, com);
					});
				},
				function(com, callback) {
					// 3. com_decの削除
					console.log("3. start");
					var tmp_dec = [];
					var str3 = "";
					if (com.length > 0) { // 条件として削除するcomがあること前提
						str3 = "DELETE FROM com_dec WHERE";
						for (var i in com) {
							if (i == 0) {
								str3 = str3 + " com_id=" + com[i].id;
							} else {
								str3 = str3 + " OR com_id=" + com[i].id;
							}
						}
						console.log("[str3]query -> " + str3);
						client.query(str3, (err, result) => {
							done();
							if (err) {
								console.log("com_dec delete Error!");
							} else {
								for (var i = 0; i < result.rows.length; i++) {
									flg = true;
									for (var j = 0; j < tmp_dec.length; j++) {
										if (result.rows[i].dec_id === tmp_dec[j].id) {
											flg = false;
											break;
										}
									}
									if (flg) {
										tmp_dec = tmp_dec.concat({id: result.rows[i].dec_id});
									}
								}
							}
							// デバッグログ
							for (var i in tmp_dec) {
								console.log("tmp_dec[" + i + "] -> " + tmp_dec[i].id);
							}
							callback(null, com, tmp_dec);
						});
					} else {
						callback(null, com, tmp_dec);
					}
				},
				function(com, tmp_dec, callback) {
					// 4. com_decのcheck
					console.log("4. start");
					var dec = [];
					const str4 = "SELECT * FROM declaration d WHERE NOT EXISTS (SELECT * FROM com_dec cd WHERE d.id=cd.dec_id)";
					console.log("[str4]query -> " + str4);
					client.query(str4, (err, result) => {
						done();
						if (err) {
							console.log("check com_dec Error!");
						} else {
							for (var i = 0; i < result.rows.length; i++) {
								dec = dec.concat({id: result.rows[i].id});
							}
						}
						// デバッグログ
						for (var i in dec) {
							console.log("dec[" + i + "] -> " + dec[i].id);
						}
						callback(null, com, dec);
					});
				},
				function(com, dec, callback) {
					// 5. declarationの削除
					console.log("5. start");
					var str5 = "";
					if (dec.length > 0) { // 条件として削除するdecがあること前提
						str5 = "DELETE FROM declaration WHERE"
						for (var i in dec) {
							if (i == 0) {
								str5 = str5 + " id=" + dec[i].id;
							} else {
								str5 = str5 + " OR id=" + dec[i].id;
							}
						}
						console.log("[str5]query -> " + str5);
						client.query(str5, (err, result) => {
							done();
							if (err) {
								console.log("declaration delete Error!");
							} else {
								console.log("declaration delete success.");
							}
							callback(null, com, dec);
						});
					} else {
						callback(null, com, dec);
					}
				},
				function(com, dec, callback) {
					// 6. componentの削除
					console.log("6. start");
					var str6 = "";
					if (com.length > 0) { // 条件として削除するcomがあること前提
						str6 = "DELETE FROM component WHERE"
						for (var i in com) {
							if (i == 0) {
								str6 = str6 + " id=" + com[i].id;
							} else {
								str6 = str6 + " OR id=" + com[i].id;
							}
						}
						console.log("[str6]query -> " + str6);
						client.query(str6, (err, result) => {
							done();
							if (err) {
								console.log("component delete Error!");
							} else {
								console.log("component delete success.");
							}
							callback(null, com, dec);
						});
					} else {
						callback(null, com, dec);
					}
				},
				function(com, dec, callback) {
					// 7. templateの削除
					console.log("7. start");
					const str7 = "DELETE FROM template WHERE id=" + tem_id;
					console.log("[str7]query -> " + str7);
					client.query(str7, (err, result) => {
						done();
						if (err) {
							console.log("template delete Error!");
						} else {
							console.log("template delete success.");
						}
						callback(null, com, dec);
					});
				}
			], function(err, com, dec) {
				if (err) {
					throw err;
				}
				// 8. templateの反映
				console.log("8. start");
				client.query("SELECT id, name FROM template", (err, result) => {
					done();
					if (err) {
						console.log("template loading Error!");
					} else {
						console.log("connect template table.");
						var tmp = [];
						for (var i = 0; i < result.rows.length; i++) {
							tmp = tmp.concat({id: result.rows[i].id, name: result.rows[i].name});
						}
						sender.returnValue = tmp;
					}
				});
			});
		}
	});
});

ipcMain.on("delete-component", (sender, tem_id, com_id) => {
	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {
		if (err) {
			// DB接続失敗
			console.log(err);
		} else {
			// DB接続成功
			async.waterfall([
				function(callback) {
					// 1. tem_comの削除
					console.log("1. start");
					var tmp_com = [];
					const str1 = "DELETE FROM tem_com WHERE tem_id=" + tem_id + " AND com_id=" + com_id + " RETURNING com_id";
					console.log("[str1]query -> " + str1);
					client.query(str1, (err, result) => {
						done();
						if (err) {
							console.log("tem_com delete Error!");
						} else {
							console.log("tem_com delete success. " + result.rows.length);
							for (var i = 0; i < result.rows.length; i++) {
								tmp_com = tmp_com.concat({id: result.rows[i].com_id});
								console.log(i + " tmp_com: " + tmp_com);
							}
						}
						// デバッグログ
						console.log("tmp_com: " + tmp_com.length);
						for (var i in tmp_com) {
							console.log("tmp_com[" + i + "] -> " + tmp_com[i].id);
						}
						callback(null, tmp_com);
					});
				},
				function(tmp_com, callback) {
					// 2. tem_comのcheck
					console.log("2. start");
					var com = [];
					const str2 = "SELECT * FROM component c WHERE NOT EXISTS (SELECT * FROM tem_com tc WHERE c.id=tc.com_id)";
					console.log("[str2]query -> " + str2);
					client.query(str2, (err, result) => {
						done();
						if (err) {
							console.log("check tem_com Error!");
						} else {
							for (var i = 0; i < result.rows.length; i++) {
								com = com.concat({id: result.rows[i].id});
							}
						}
						// デバッグログ
						console.log("com: " + com.length);
						for (var i in com) {
							console.log("com[" + i + "] -> " + com[i].id);
						}
						callback(null, com);
					});
				},
				function(com, callback) {
					// 3. com_decの削除
					console.log("3. start");
					var tmp_dec = [];
					var str3 = "";
					if (com.length > 0) { // 条件として削除するcomがあること前提
						str3 = "DELETE FROM com_dec WHERE";
						for (var i in com) {
							if (i == 0) {
								str3 = str3 + " com_id=" + com[i].id;
							} else {
								str3 = str3 + " OR com_id=" + com[i].id;
							}
						}
						console.log("[str3]query -> " + str3);
						client.query(str3, (err, result) => {
							done();
							if (err) {
								console.log("com_dec delete Error!");
							} else {
								for (var i = 0; i < result.rows.length; i++) {
									flg = true;
									for (var j = 0; j < tmp_dec.length; j++) {
										if (result.rows[i].dec_id === tmp_dec[j].id) {
											flg = false;
											break;
										}
									}
									if (flg) {
										tmp_dec = tmp_dec.concat({id: result.rows[i].dec_id});
									}
								}
							}
							// デバッグログ
							for (var i in tmp_dec) {
								console.log("tmp_dec[" + i + "] -> " + tmp_dec[i].id);
							}
							callback(null, com, tmp_dec);
						});
					} else {
						callback(null, com, tmp_dec);
					}
				},
				function(com, tmp_dec, callback) {
					// 4. com_decのcheck
					console.log("4. start");
					var dec = [];
					const str4 = "SELECT * FROM declaration d WHERE NOT EXISTS (SELECT * FROM com_dec cd WHERE d.id=cd.dec_id)";
					console.log("[str4]query -> " + str4);
					client.query(str4, (err, result) => {
						done();
						if (err) {
							console.log("check com_dec Error!");
						} else {
							for (var i = 0; i < result.rows.length; i++) {
								dec = dec.concat({id: result.rows[i].id});
							}
						}
						// デバッグログ
						for (var i in dec) {
							console.log("dec[" + i + "] -> " + dec[i].id);
						}
						callback(null, com, dec);
					});
				},
				function(com, dec, callback) {
					// 5. declarationの削除
					console.log("5. start");
					var str5 = "";
					if (dec.length > 0) { // 条件として削除するdecがあること前提
						str5 = "DELETE FROM declaration WHERE"
						for (var i in dec) {
							if (i == 0) {
								str5 = str5 + " id=" + dec[i].id;
							} else {
								str5 = str5 + " OR id=" + dec[i].id;
							}
						}
						console.log("[str5]query -> " + str5);
						client.query(str5, (err, result) => {
							done();
							if (err) {
								console.log("declaration delete Error!");
							} else {
								console.log("declaration delete success.");
							}
							callback(null, com, dec);
						});
					} else {
						callback(null, com, dec);
					}
				},
				function(com, dec, callback) {
					// 6. componentの削除
					console.log("6. start");
					var str6 = "";
					if (com.length > 0) { // 条件として削除するcomがあること前提
						str6 = "DELETE FROM component WHERE"
						for (var i in com) {
							if (i == 0) {
								str6 = str6 + " id=" + com[i].id;
							} else {
								str6 = str6 + " OR id=" + com[i].id;
							}
						}
						console.log("[str6]query -> " + str6);
						client.query(str6, (err, result) => {
							done();
							if (err) {
								console.log("component delete Error!");
							} else {
								console.log("component delete success.");
							}
							callback(null, com, dec);
						});
					} else {
						callback(null, com, dec);
					}
				}
			], function(err, com, dec) {
				const str7 = "SELECT c.id, c.name FROM component c, template t, tem_com tc WHERE t.id=tc.tem_id AND c.id=tc.com_id AND t.id=" + tem_id;
				console.log("query -> " + str7);
				client.query(str7, (err, result) => {
					done();
					if (err) {
						console.log("component loading Error!");
					} else {
						console.log("connect component table.");
						var tmp = [];
						for (var i = 0; i < result.rows.length; i++) {
							tmp = tmp.concat({id: result.rows[i].id, name: result.rows[i].name});
						}
						sender.returnValue = tmp;
					}
				});
			});
		}
	});
});

ipcMain.on("delete-declaration", (sender, com_id, dec_id) => {
	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {
		if (err) {
			// DB接続失敗
			console.log(err);
		} else {
			// DB接続成功
			async.waterfall([
				function(callback) {
					// 1. com_decの削除
					var tmp_dec = [];
					var str1 = "";
					str1 = "DELETE FROM com_dec WHERE com_id=" + com_id + " AND dec_id=" + dec_id + " RETURNING dec_id";
					console.log("[str1]query -> " + str1);
					client.query(str1, (err, result) => {
						done();
						if (err) {
							console.log("com_dec delete Error!");
						} else {
							for (var i = 0; i < result.rows.length; i++) {
								tmp_dec = tmp_dec.concat({id: result.rows[i].dec_id});
							}
						}
						// デバッグログ
						for (var i in tmp_dec) {
							console.log("tmp_dec[" + i + "] -> " + tmp_dec[i].id);
						}
						callback(null, tmp_dec);
					});
				},
				function(tmp_dec, callback) {
					// 2. com_decのcheck
					var dec = [];
					const str2 = "SELECT * FROM declaration d WHERE NOT EXISTS (SELECT * FROM com_dec cd WHERE d.id=cd.dec_id)";
					console.log("[str2]query -> " + str2);
					client.query(str2, (err, result) => {
						done();
						if (err) {
							console.log("check com_dec Error!");
						} else {
							for (var i = 0; i < result.rows.length; i++) {
								dec = dec.concat({id: result.rows[i].id});
							}
						}
						// デバッグログ
						for (var i in dec) {
							console.log("dec[" + i + "] -> " + dec[i].id);
						}
						callback(null, dec);
					});
				}
			], function(err, dec) {
				// 3. declarationの削除
				var str3 = "";
				if (dec.length > 0) { // 条件として削除するdecがあること前提
					str3 = "DELETE FROM declaration WHERE"
					for (var i in dec) {
						if (i == 0) {
							str3 = str3 + " id=" + dec[i].id;
						} else {
							str3 = str3 + " OR id=" + dec[i].id;
						}
					}
					console.log("[str3]query -> " + str3);
					client.query(str3, (err, result) => {
						done();
						if (err) {
							console.log("declaration delete Error!");
						} else {
							console.log("declaration delete success.");
							sender.returnValue = null;
						}
					});
				} else {
					sender.returnValue = null;
				}
			});
		}
	});
});

ipcMain.on("update-template", (sender, id, name) => {
	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {
		if (err) {
			// DB接続失敗
			console.log(err);
		} else {
			// DB接続成功
			const str = "UPDATE template SET name='" + name + "' WHERE id=" + id;
			console.log("query -> " + str);
			client.query(str, (err, result) => {
				done();
				if (err) {
					console.log("template update Error!");
				} else {
					console.log("template update success.");
				}
			});
			client.query("SELECT id, name FROM template", (err, result) => {
				done();
				if (err) {
					console.log("template loading Error!");
				} else {
					console.log("connect template table.");
					var tmp = [];
					for (var i = 0; i < result.rows.length; i++) {
						tmp = tmp.concat({id: result.rows[i].id, name: result.rows[i].name});
					}
					sender.returnValue = tmp;
				}
			});
		}
	});
});

ipcMain.on("update-component", (sender, id, name, tem_id) => {
	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {
		if (err) {
			// DB接続失敗
			console.log(err);
		} else {
			// DB接続成功
			const str = "UPDATE component SET name='" + name + "' WHERE id=" + id;
			console.log("query -> " + str);
			client.query(str, (err, result) => {
				done();
				if (err) {
					console.log("component update Error!");
				} else {
					console.log("component update success.");
				}
			});
			const str2 = "SELECT c.id, c.name FROM component c, template t, tem_com tc WHERE t.id=tc.tem_id AND c.id=tc.com_id AND t.id=" + tem_id;
			console.log("query -> " + str2);
			client.query(str2, (err, result) => {
				done();
				if (err) {
					console.log("component loading Error!");
				} else {
					console.log("connect component table.");
					var tmp = [];
					for (var i = 0; i < result.rows.length; i++) {
						tmp = tmp.concat({id: result.rows[i].id, name: result.rows[i].name});
					}
					sender.returnValue = tmp;
				}
			});
		}
	});
});

ipcMain.on("update-declaration", (sender, com_id, id, property, value) => {
	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {
		if (err) {
			// DB接続失敗
			console.log(err);
		} else {
			// DB接続成功
			async.waterfall([
				function(callback) {
					const str1 = "SELECT * FROM declaration WHERE property='" + property + "' AND value='" + value + "'";
					console.log("[str1]query -> " + str1);
					client.query(str1, (err, result) => {
						done();
						if (err) {
							console.log("declaration check1 Error!");
						} else {
							if (result.rows.length == 1) {
								callback(null, result.rows[0].id);
							} else {
								callback(null, null);
							}
						}
					});
				},
				function(dec_id, callback) {
					const str2 = "SELECT * FROM com_dec WHERE dec_id=" + id;
					console.log("[str2]query -> " + str2);
					client.query(str2, (err, result) => {
						done();
						if (err) {
							console.log("declaration check2 Error!");
						} else {
							if (result.rows.length > 1) {
								callback(null, dec_id, true);
							} else {
								callback(null, dec_id, false);
							}
						}
					});
				},
				function(dec_id, check, callback) {
					if ((dec_id == null) && check) { // false, true
						const str3 = "INSERT INTO declaration (property, value) VALUES ('" + property + "', '" + value + "') RETURNING id";
						console.log("[str3]query -> " + str3);
						client.query(str3, (err, result) => {
							done();
							if (err) {
								console.log("update declaration step 1 Error!");
							} else {
								callback(null, dec_id, check, result.rows[0].id);
							}
						});
					} else {
						callback(null, dec_id, check, dec_id);
					}
				},
				function(check1, check2, dec_id, callback) {
					if ((check1 != null) || (check2)) {
						const str4 = "UPDATE com_dec SET dec_id=" + dec_id + " WHERE com_id=" + com_id + " AND dec_id=" + id;
						console.log("[str4]query -> " + str4);
						client.query(str4, (err, result) => {
							done();
							if (err) {
								console.log("update declaration step 2 Error!");
							} else {
								callback(null, check1, check2, dec_id);
							}
						});
					} else {
						callback(null, check1, check2, dec_id);
					}
				}
			], function(err, check1, check2, dec_id) {
				if ((check1 != null) && (!check2)) { // true, false
					const str5 = "DELETE FROM declaration WHERE id=" + dec_id;
					console.log("[str5]query -> " + str5);
					client.query(str5, (err, result) => {
						done();
						if (err) {
							console.log("update declaration step 3-1 Error!");
						} else {
							console.log("update declaration success end.");
							sender.returnValue = null;
						}
					});
				} else if ((check1 == null) && (!check2)) { // false, false
					const str5 = "UPDATE declaration SET value='" + value + "' WHERE id=" + dec_id;
					cnosole.log("[str5]query -> " + str5);
					client.query(str5, (err, result) => {
						done();
						if (err) {
							console.log("update declaration step 3-2 Error!");
						} else {
							console.log("update declaration success end.");
							sender.returnValue = null;
						}
					});
				} else {
					console.log("update declaration success end.");
					sender.returnValue = null;
				}
			});
		}
	});
});

ipcMain.on("set-json", (sender, newHost, newUser, newDB, newPW) => {
	var json = {
		host: newHost,
		user: newUser,
		db: newDB,
		password: newPW
	};
	storage.set('config', json, (err) => {
		if (err) {
			console.log(err);
		} else {
			console.log("New config File.");
		}
	});
});

ipcMain.on("open-css-file", (sender) => {
	var options = {
		title: "Open CSS File",
		defaultPath: app.getPath('documents'),
		filters: [
			{name: 'CSS File', extensions: ['css']}
		],
		properties: ["openFile"]
	};

	dialog.showOpenDialog(options, function(filename){
		if (filename) {
			console.log(filename);
			// readFile(filename[0]);
			sender.returnValue = filename[0];
		} else {
			sender.returnValue = '';
		}
	});
});

ipcMain.on("css-parse", (sender, filename) => {
	// var currentPath = filename;
	fs.readFile(filename, function(error, text) {
		if (error) {
			alert("CSS import Error: " + error);
			return;
		} else {
			// console.log(text.toString());
			var css = Parser.cssParser(text.toString());
			console.log(css);
			sender.returnValue = css;
		}
	});
});

ipcMain.on("save-sql-file", (sender) => {
	var options = {
		title: "Save SQL File",
		defaultPath: app.getPath('documents'),
		filters: [
			{name: 'sql', extensions: ['sql']}
		]
	};

	dialog.showSaveDialog(options, function(filename) {
		if (filename) {
			sender.returnValue = filename;
		} else {
			sender.returnValue = '';
		}
	});
});

ipcMain.on('export-sql-file', (sender, filename) => {
	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {
		if (err) {
			// DB接続失敗
			console.log(err);
		} else {
			// DB接続成功
			var data = '';
			async.waterfall([
				function(callback) {
					// drop table, create table
					var tmp = '';
					tmp = tmp + 'DROP TABLE com_dec;\n';
					tmp = tmp + 'DROP TABLE tem_com;\n';
					tmp = tmp + 'DROP TABLE declaration;\n';
					tmp = tmp + 'DROP TABLE component;\n';
					tmp = tmp + 'DROP TABLE template;\n\n';

					tmp = tmp + 'CREATE TABLE template (id serial PRIMARY KEY, name varchar);\n';
					tmp = tmp + 'CREATE TABLE component (id serial PRIMARY KEY, name varchar);\n';
					tmp = tmp + 'CREATE TABLE declaration (id serial PRIMARY KEY property varchar, value varchar, UNIQUE (property, value));\n';
					tmp = tmp + 'CREATE TABLE com_dec (com_id int REFERENCES component (id), dec_id int REFERENCES declaration (id));\n';
					tmp = tmp + 'CREATE TABLE tem_com (tem_id int REFERENCES template (id), com_id int REFERENCES component (id));\n\n';

					callback(null, tmp);
				},
				function(tmp, callback) {
					// declaration table insert
					var str1 = "SELECT * FROM declaration";
					console.log("[str1]query -> " + str1);
					client.query(str1, (err, result) => {
						done();
						if (err) {
							console.log("declaration Error!");
						} else {
							var id = 0;
							for (var i = 0; i < result.rows.length; i++) {
								tmp = tmp + "INSERT INTO declaration VALUES (" + result.rows[i].id + ", '" + result.rows[i].property + "', '" + result.rows[i].value + "');\n";
								if (result.rows[i].id > id) {
									id = result.rows[i].id;
								}
							}
							tmp = tmp + "SELECT SETVAL ('declaration_id_seq', " + id + ");\n\n";
						}
						callback(null, tmp);
					});
				},
				function(tmp, callback) {
					// component table insert
					var str2 = "SELECT * FROM component";
					console.log("[str2]query -> " + str2);
					client.query(str2, (err, result) => {
						done();
						if (err) {
							console.log("component Error!");
						} else {
							var id = 0;
							for (var i = 0; i < result.rows.length; i++) {
								tmp = tmp + "INSERT INTO component VALUES (" + result.rows[i].id + ", '" + result.rows[i].name + "');\n";
								if (result.rows[i].id > id) {
									id = result.rows[i].id;
								}
							}
							tmp = tmp + "SELECT SETVAL ('component_id_seq', " + id + ");\n\n";
						}
						callback(null, tmp);
					});
				},
				function(tmp, callback) {
					// template table insert
					var str3 = "SELECT * FROM template";
					console.log("[str3]query -> " + str3);
					client.query(str3, (err, result) => {
						done();
						if (err) {
							console.log("table Error!");
						} else {
							var id = 0;
							for (var i = 0; i < result.rows.length; i++) {
								tmp = tmp + "INSERT INTO template VALUES (" + result.rows[i].id + ", '" + result.rows[i].name + "');\n";
								if (result.rows[i].id > id) {
									id = result.rows[i].id;
								}
							}
							tmp = tmp + "SELECT SETVAL ('template_id_seq', " + id + ");\n\n";
						}
						callback(null, tmp);
					});
				},
				function(tmp, callback) {
					// com_dec table insert
					var str4 = "SELECT * FROM com_dec";
					console.log("[str4]query -> " + str4);
					client.query(str4, (err, result) => {
						done();
						if (err) {
							console.log("com_dec Error!");
						} else {
							for (var i = 0; i < result.rows.length; i++) {
								tmp = tmp + "INSERT INTO com_dec VALUES (" + result.rows[i].com_id + ", " + result.rows[i].dec_id + ");\n";
							}
						}
						callback(null, tmp);
					});
				},
				function(tmp, callback) {
					// tem_com table insert
					var str5 = "SELECT * FROM tem_com";
					console.log("[str5]query -> " + str5);
					client.query(str5, (err, result) => {
						done();
						if (err) {
							console.log("tem_dec Error!");
						} else {
							for (var i = 0; i < result.rows.length; i++) {
								tmp = tmp + "INSERT INTO tem_com VALUES (" + result.rows[i].tem_id + ", " + result.rows[i].com_id + ");\n";
							}
						}
						callback(null, tmp);
					});
				}
			], function(err, tmp) {
				fs.writeFile(filename, tmp, function(error) {
					if (error != null) {
						console.log("Export SQL File Error! : " + error);
						sender.returnValue = error;
					} else {
						console.log("Export SQL File Complete.");
						sender.returnValue = null;
					}
				});
			});
		}
	});
});

ipcMain.on("get-host", (sender) => {
	sender.returnValue = host;
});

ipcMain.on("get-user", (sender) => {
	sender.returnValue = user;
});

ipcMain.on("get-db", (sender) => {
	sender.returnValue = db;
});

ipcMain.on("get-pw", (sender) => {
	sender.returnValue = password;
});

ipcMain.on("get-window-size", (sender) => {
	sender.returnValue = mainWindow.getSize();
});

ipcMain.on("select-menu-log", (sender, e) => {
	console.log("[SelectMenu]: " + e);
});

ipcMain.on("log-conString", (sender, cons) => {
	console.log("conString => " + cons);
});

ipcMain.on("click-my-button", (sender, e) => {
  console.log(e);
});

ipcMain.on("go-to-index", (sender) => {
  mainWindow.loadURL(`${rootPath}/index.html`);
});
